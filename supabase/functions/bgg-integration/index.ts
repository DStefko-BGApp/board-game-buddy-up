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
  designers?: string[];
  publishers?: string[];
  rating?: number;
  complexity?: number;
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

    const { searchTerm, bggId, userId, gameData } = await req.json()

    switch (req.method) {
      case 'POST':
        if (searchTerm) {
          // Search for games on BGG
          console.log(`Searching BGG for: ${searchTerm}`)
          const searchResults = await searchBGG(searchTerm)
          
          return new Response(
            JSON.stringify({ success: true, data: searchResults }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (bggId) {
          // Get detailed game information from BGG
          console.log(`Fetching BGG game details for ID: ${bggId}`)
          const gameDetails = await getGameDetails(bggId)
          
          if (gameDetails) {
            // Store/update game in our database
            const { data: existingGame } = await supabase
              .from('games')
              .select('*')
              .eq('bgg_id', bggId)
              .single()

            let game
            if (existingGame) {
              // Update existing game
              const { data, error } = await supabase
                .from('games')
                .update(gameDetails)
                .eq('bgg_id', bggId)
                .select()
                .single()
              
              if (error) throw error
              game = data
            } else {
              // Insert new game
              const { data, error } = await supabase
                .from('games')
                .insert(gameDetails)
                .select()
                .single()
              
              if (error) throw error
              game = data
            }

            // If userId is provided, add to user's library
            if (userId) {
              const { error: userGameError } = await supabase
                .from('user_games')
                .insert({
                  user_id: userId,
                  game_id: game.id
                })
              
              if (userGameError && !userGameError.message.includes('duplicate')) {
                throw userGameError
              }
            }

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
    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(searchTerm)}&type=boardgame`
    console.log(`Calling BGG search API: ${searchUrl}`)
    
    const response = await fetch(searchUrl)
    const xmlText = await response.text()
    
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
    const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`
    console.log(`Calling BGG details API: ${detailUrl}`)
    
    const response = await fetch(detailUrl)
    const xmlText = await response.text()
    
    // Extract game details from XML
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
      designers: designers.length > 0 ? designers : undefined,
      publishers: publishers.length > 0 ? publishers : undefined,
      rating: ratingMatch && ratingMatch[1] !== '0' ? parseFloat(ratingMatch[1]) : undefined,
      complexity: complexityMatch && complexityMatch[1] !== '0' ? parseFloat(complexityMatch[1]) : undefined,
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