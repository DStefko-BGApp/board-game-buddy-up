import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { gameId, isExpansion, baseGameBggId } = await req.json()

    console.log(`Updating game expansion relationship: ${gameId}, isExpansion: ${isExpansion}, baseGameBggId: ${baseGameBggId}`)

    // First get the game to update
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('bgg_id', gameId)
      .single()

    if (gameError || !gameData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Game not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the game's expansion relationship
    const updateData: any = {
      is_expansion: isExpansion,
      base_game_bgg_id: isExpansion && baseGameBggId ? parseInt(baseGameBggId) : null
    }

    const { error: updateError } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameData.id)

    if (updateError) {
      console.error('Error updating game:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update game expansion relationship' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated game expansion relationship`)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-game-expansion function:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})