import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { links } = body

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ error: 'Links array is required' }, { status: 400 })
    }

    // Validate all links have required fields
    for (const link of links) {
      if (!link.name || !link.url) {
        return NextResponse.json({ error: 'Name and URL are required for all links' }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('links')
      .insert(links.map(link => ({ name: link.name, url: link.url })))
      .select()

    if (error) {
      console.error('Supabase batch insert error:', error)
      return NextResponse.json({ error: 'Failed to create links' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Batch POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const startTime = performance.now()
    const body = await req.json()
    const { links } = body

    if (!Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ error: 'Links array is required' }, { status: 400 })
    }

    console.log(`🔄 Starting batch update for ${links.length} links`)

    // Validate all links have required fields
    for (const link of links) {
      if (!link.id || !link.name || !link.url) {
        return NextResponse.json({ error: 'ID, name and URL are required for all links' }, { status: 400 })
      }
    }

    // For batch updates, we need to update each link individually
    // since Supabase doesn't support batch updates with different data
    // But we can make all updates in parallel using Promise.all()
    const updatePromises = links.map(async (link) => {
      const { data, error } = await supabase
        .from('links')
        .update({ name: link.name, url: link.url })
        .eq('id', link.id)
        .select()

      if (error) {
        console.error('Supabase batch update error for link:', link.id, error)
        throw new Error(`Failed to update link ${link.id}: ${error.message}`)
      }

      return data[0]
    })

    try {
      const results = await Promise.all(updatePromises)
      const endTime = performance.now()
      console.log(`✅ Batch update completed in ${(endTime - startTime).toFixed(2)}ms for ${links.length} links`)
      return NextResponse.json(results)
    } catch (error) {
      console.error('Batch update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
  } catch (err) {
    console.error('Batch PUT error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
