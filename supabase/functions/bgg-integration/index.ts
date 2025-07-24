import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BGGGameData {
  bgg_id: number;
  name: string;
  year_published?: number;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
  min_age?: number;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  categories?: string[];
  mechanics?: string[];
  core_mechanic?: string;
  designers?: string[];
  publishers?: string[];
  rating?: number;
  complexity?: number;
  is_expansion?: boolean;
  base_game_bgg_id?: number;
  expands_games?: number[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    
    // Create Supabase client with user's auth token for RLS compliance
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: authHeader ? {
            Authorization: authHeader,
          } : {},
        },
      }
    )

    // Parse request body once
    const requestBody = await req.json()
    const { searchTerm, bggId, userId, bggUsername, status } = requestBody

    switch (req.method) {
      case 'POST':
        // Check URL path to determine operation
        const url = new URL(req.url)
        
        if (url.pathname.includes('sync-collection')) {
          // Sync user's BGG collection
          console.log(`Syncing BGG collection for user: ${bggUsername}`)
          
          const syncResult = await syncBGGCollection(supabase, bggUsername, userId)
          
          return new Response(
            JSON.stringify({ success: true, data: syncResult }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (searchTerm) {
          // Search for games on BGG
          console.log(`Searching BGG for: ${searchTerm}`)
          const searchResults = await searchBGG(searchTerm)
          
          return new Response(
            JSON.stringify({ success: true, data: searchResults }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (bggId && userId) {
          // Get detailed game information from BGG and add to user library
          console.log(`Fetching BGG game details for ID: ${bggId}`)
          const gameDetails = await getGameDetails(bggId)
          
          if (gameDetails) {
            const game = await upsertGame(supabase, gameDetails)
            await addToUserLibrary(supabase, userId, game.id, status)

            return new Response(
              JSON.stringify({ success: true, data: game }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } else {
            return new Response(
              JSON.stringify({ success: false, error: 'Game not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
          }
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }

  } catch (error) {
    console.error('Error in bgg-integration function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function searchBGG(searchTerm: string) {
  try {
    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(searchTerm)}&type=boardgame&exact=0`
    console.log(`Calling BGG search API: ${searchUrl}`)
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'BoardGameLibrary/1.0 (Lovable Project)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`BGG API responded with status ${response.status}`)
    }
    
    const xmlText = await response.text()
    
    // Check for BGG error responses
    if (xmlText.includes('Rate limit exceeded')) {
      throw new Error('BGG API rate limit exceeded. Please try again later.')
    }
    
    // Parse XML manually (simple approach for BGG API)
    const games = []
    const itemRegex = /<item[^>]*id="(\d+)"[^>]*>/g
    const nameRegex = /<name[^>]*value="([^"]*)"[^>]*>/g
    const yearRegex = /<yearpublished[^>]*value="(\d+)"[^>]*>/g
    
    let match
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = xmlText.substring(match.index, xmlText.indexOf('</item>', match.index) + 7)
      const id = parseInt(match[1])
      
      const nameMatch = nameRegex.exec(itemXml)
      const yearMatch = yearRegex.exec(itemXml)
      
      nameRegex.lastIndex = 0 // Reset regex
      yearRegex.lastIndex = 0
      
      if (nameMatch) {
        games.push({
          bgg_id: id,
          name: nameMatch[1],
          year_published: yearMatch ? parseInt(yearMatch[1]) : null
        })
      }
    }
    
    console.log(`Found ${games.length} games from BGG search`)
    return games.slice(0, 10) // Limit to 10 results
    
  } catch (error) {
    console.error('Error searching BGG:', error)
    throw error
  }
}

async function getGameDetails(bggId: number): Promise<BGGGameData | null> {
  try {
    const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1&versions=1`
    console.log(`Calling BGG details API: ${detailUrl}`)
    
    const response = await fetch(detailUrl, {
      headers: {
        'User-Agent': 'BoardGameLibrary/1.0 (Lovable Project)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`BGG API responded with status ${response.status}`)
    }
    
    const xmlText = await response.text()
    
    // Check for BGG error responses
    if (xmlText.includes('Rate limit exceeded')) {
      throw new Error('BGG API rate limit exceeded. Please try again later.')
    }
    
    if (xmlText.includes('This item could not be found')) {
      console.log(`Game with BGG ID ${bggId} not found`)
      return null
    }
    
    // Extract game details from XML with improved parsing
    const nameMatch = xmlText.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
    const yearMatch = xmlText.match(/<yearpublished[^>]*value="(\d+)"/)
    const minPlayersMatch = xmlText.match(/<minplayers[^>]*value="(\d+)"/)
    const maxPlayersMatch = xmlText.match(/<maxplayers[^>]*value="(\d+)"/)
    const playingTimeMatch = xmlText.match(/<playingtime[^>]*value="(\d+)"/)
    const minAgeMatch = xmlText.match(/<minage[^>]*value="(\d+)"/)
    const descriptionMatch = xmlText.match(/<description>(.*?)<\/description>/s)
    const imageMatch = xmlText.match(/<image>([^<]*)<\/image>/)
    const thumbnailMatch = xmlText.match(/<thumbnail>([^<]*)<\/thumbnail>/)
    const ratingMatch = xmlText.match(/<average[^>]*value="([^"]*)"/)
    const complexityMatch = xmlText.match(/<averageweight[^>]*value="([^"]*)"/)
    
    // Extract categories, mechanics, designers, publishers
    const categories = extractLinks(xmlText, 'boardgamecategory')
    const mechanics = extractLinks(xmlText, 'boardgamemechanic')
    const designers = extractLinks(xmlText, 'boardgamedesigner')
    const publishers = extractLinks(xmlText, 'boardgamepublisher')
    
    // Extract expansion relationships
    const expansionLinks = extractExpansionLinks(xmlText)
    const isExpansion = expansionLinks.expands.length > 0
    const baseGameBggId = isExpansion ? expansionLinks.expands[0] : undefined
    const expandsGames = expansionLinks.expandedBy.length > 0 ? expansionLinks.expandedBy : undefined
    
    if (!nameMatch) {
      console.log('No game name found in BGG response')
      return null
    }
    
    const gameData: BGGGameData = {
      bgg_id: bggId,
      name: nameMatch[1],
      year_published: yearMatch ? parseInt(yearMatch[1]) : undefined,
      min_players: minPlayersMatch ? parseInt(minPlayersMatch[1]) : undefined,
      max_players: maxPlayersMatch ? parseInt(maxPlayersMatch[1]) : undefined,
      playing_time: playingTimeMatch ? parseInt(playingTimeMatch[1]) : undefined,
      min_age: minAgeMatch ? parseInt(minAgeMatch[1]) : undefined,
      description: descriptionMatch ? descriptionMatch[1].replace(/&#10;/g, '\n').replace(/&quot;/g, '"').replace(/&amp;/g, '&') : undefined,
      image_url: imageMatch ? imageMatch[1] : undefined,
      thumbnail_url: thumbnailMatch ? thumbnailMatch[1] : undefined,
      categories: categories.length > 0 ? categories : undefined,
      mechanics: mechanics.length > 0 ? mechanics : undefined,
      core_mechanic: mechanics.length > 0 ? mechanics[0] : undefined,
      designers: designers.length > 0 ? designers : undefined,
      publishers: publishers.length > 0 ? publishers : undefined,
      rating: ratingMatch && ratingMatch[1] !== '0' ? parseFloat(ratingMatch[1]) : undefined,
      complexity: complexityMatch && complexityMatch[1] !== '0' ? parseFloat(complexityMatch[1]) : undefined,
      is_expansion: isExpansion,
      base_game_bgg_id: baseGameBggId,
      expands_games: expandsGames,
    }
    
    console.log(`Successfully parsed game details for: ${gameData.name}`)
    return gameData
    
  } catch (error) {
    console.error('Error getting game details from BGG:', error)
    return null
  }
}

function extractLinks(xmlText: string, type: string): string[] {
  const regex = new RegExp(`<link[^>]*type="${type}"[^>]*value="([^"]*)"`, 'g')
  const results = []
  let match
  
  while ((match = regex.exec(xmlText)) !== null) {
    results.push(match[1])
  }
  
  return results
}

function extractExpansionLinks(xmlText: string): { expands: number[], expandedBy: number[] } {
  const expands: number[] = []
  const expandedBy: number[] = []
  
  // Look for boardgameexpansion links - these indicate what this game expands
  const expansionRegex = /<link[^>]*type="boardgameexpansion"[^>]*id="(\d+)"[^>]*>/g
  let match
  
  while ((match = expansionRegex.exec(xmlText)) !== null) {
    expands.push(parseInt(match[1]))
  }
  
  // Note: BGG doesn't include reverse expansion links in game details
  // We'd need to search for games that expand this one separately
  // For now, we'll focus on identifying expansions
  
  return { expands, expandedBy }
}

async function syncBGGCollection(supabase: any, bggUsername: string, userId: string) {
  try {
    console.log(`Fetching BGG collection for user: ${bggUsername}`)
    
    // Enhanced collection URL with better parameters
    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(bggUsername)}&own=1&stats=1&excludesubtype=boardgameexpansion`
    
    const response = await fetch(collectionUrl, {
      headers: {
        'User-Agent': 'BoardGameLibrary/1.0 (Lovable Project)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`BGG API responded with status ${response.status}`)
    }
    
    const xmlText = await response.text()
    
    // Enhanced error handling for BGG collection responses
    if (xmlText.includes('Your request for this collection has been accepted')) {
      throw new Error('BGG collection is queued for processing. Please try again in a few moments.')
    }
    
    if (xmlText.includes('Invalid username specified') || xmlText.includes('User not found')) {
      throw new Error('Invalid BGG username specified')
    }
    
    if (xmlText.includes('Rate limit exceeded')) {
      throw new Error('BGG API rate limit exceeded. Please try again later.')
    }
    
    if (xmlText.includes('<items total="0"') || !xmlText.includes('<items')) {
      throw new Error('No owned games found in BGG collection')
    }
    
    // Parse collection XML with improved error handling
    const games = []
    const itemRegex = /<item[^>]*objectid="(\d+)"[^>]*>/g
    let match
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = xmlText.substring(match.index, xmlText.indexOf('</item>', match.index) + 7)
      const bggId = parseInt(match[1])
      
      // Extract basic info from collection
      const nameMatch = itemXml.match(/<name[^>]*>([^<]*)<\/name>/)
      const yearMatch = itemXml.match(/<yearpublished>(\d+)<\/yearpublished>/)
      
      if (nameMatch) {
        games.push({
          bgg_id: bggId,
          name: nameMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          year_published: yearMatch ? parseInt(yearMatch[1]) : null
        })
      }
    }
    
    console.log(`Found ${games.length} games in BGG collection`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    // Process games in optimized batches with retry logic
    for (let i = 0; i < games.length; i += 3) {
      const batch = games.slice(i, i + 3)
      
      await Promise.all(batch.map(async (gameInfo) => {
        let retries = 0
        const maxRetries = 3
        
        while (retries < maxRetries) {
          try {
            // Check if game already exists in user's library
            const { data: existingUserGame } = await supabase
              .from('user_games')
              .select('id')
              .eq('user_id', userId)
              .eq('game_id', (
                await supabase
                  .from('games')
                  .select('id')
                  .eq('bgg_id', gameInfo.bgg_id)
                  .single()
              )?.data?.id || 'none')
              .single()
            
            if (existingUserGame) {
              console.log(`Game ${gameInfo.name} already in user's library`)
              skipped++
              break
            }
            
            // Add delay between API calls to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
            
            // Fetch detailed game information from BGG
            const gameDetails = await getGameDetails(gameInfo.bgg_id)
            if (!gameDetails) {
              console.log(`Could not fetch details for game ${gameInfo.name}`)
              errors++
              break
            }
            
            // Upsert the game to the database
            const gameRecord = await upsertGame(supabase, gameDetails)
            
            // Add to user's library
            await addToUserLibrary(supabase, userId, gameRecord.id)
            
            console.log(`Successfully imported ${gameDetails.name}`)
            imported++
            break
            
          } catch (error) {
            retries++
            console.error(`Error importing game ${gameInfo.name} (attempt ${retries}):`, error)
            
            if (retries >= maxRetries) {
              errors++
              break
            }
            
            // Exponential backoff for retries
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
          }
        }
      }))
      
      // Longer delay between batches to be respectful to BGG
      if (i + 3 < games.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
                .from('games')
                .select('id')
                .eq('bgg_id', gameInfo.bgg_id)
                .single()
            )?.data?.id || 'nonexistent')
            .single()
          
          if (existingUserGame) {
            skipped++
            console.log(`Game ${gameInfo.name} already in library, skipping`)
            return
          }
          
          // Get detailed game info from BGG
          const gameDetails = await getGameDetails(gameInfo.bgg_id)
          if (!gameDetails) {
            console.log(`Could not fetch details for ${gameInfo.name}`)
            errors++
            return
          }
          
          // Add game to database and user library
          const game = await upsertGame(supabase, gameDetails)
          await addToUserLibrary(supabase, userId, game.id, 'owned')
          
          imported++
          console.log(`Imported game: ${gameDetails.name}`)
          
        } catch (error) {
          console.error(`Error importing game ${gameInfo.name}:`, error)
          errors++
        }
      }))
      
      // Small delay between batches to be nice to BGG's API
      if (i + 5 < games.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return {
      total: games.length,
      imported,
      skipped,
      errors,
      message: `Collection sync complete: ${imported} imported, ${skipped} skipped, ${errors} errors`
    }
    
  } catch (error) {
    console.error('Error syncing BGG collection:', error)
    throw error
  }
}

async function upsertGame(supabase: any, gameDetails: BGGGameData) {
  // Check if game already exists
  const { data: existingGame } = await supabase
    .from('games')
    .select('*')
    .eq('bgg_id', gameDetails.bgg_id)
    .single()

  if (existingGame) {
    // Update existing game
    const { data, error } = await supabase
      .from('games')
      .update(gameDetails)
      .eq('bgg_id', gameDetails.bgg_id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    // Insert new game
    const { data, error } = await supabase
      .from('games')
      .insert(gameDetails)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

async function addToUserLibrary(supabase: any, userId: string, gameId: string, status: string = 'owned') {
  const { error } = await supabase
    .from('user_games')
    .insert({
      user_id: userId,
      game_id: gameId,
      status: status
    })
  
  if (error && !error.message.includes('duplicate')) {
    throw error
  }
}