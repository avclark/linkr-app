'use client';

import type { LinkEntry, CreateLinkEntry } from './supabase';

export async function fetchLinks(): Promise<LinkEntry[]> {
  try {
    const res = await fetch('/api/links');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching links from Supabase:', error);
    return [];
  }
}

export async function createLink(link: CreateLinkEntry): Promise<LinkEntry | null> {
  try {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error creating link in Supabase:', error);
    return null;
  }
}

export async function updateLink(link: LinkEntry): Promise<LinkEntry | null> {
  try {
    const res = await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error updating link in Supabase:', error);
    return null;
  }
}

export async function deleteLink(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/links?id=${id}`, {
      method: 'DELETE',
    });
    
    return res.ok;
  } catch (error) {
    console.error('❌ Error deleting link from Supabase:', error);
    return false;
  }
}

// Batch create multiple links
export async function createLinksBatch(links: CreateLinkEntry[]): Promise<LinkEntry[]> {
  try {
    const res = await fetch('/api/links/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error creating links batch in Supabase:', error);
    return [];
  }
}

// Batch update multiple links
export async function updateLinksBatch(links: LinkEntry[]): Promise<LinkEntry[]> {
  try {
    const res = await fetch('/api/links/batch', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error updating links batch in Supabase:', error);
    return [];
  }
}

// Optimized function to save multiple links (creates and updates in batches)
export async function saveLinksBatch(links: LinkEntry[]): Promise<{ created: LinkEntry[], updated: LinkEntry[] }> {
  try {
    const startTime = performance.now()
    console.log('🚀 Starting batch save operation...')
    
    // Separate new links from existing ones
    const newLinks = links.filter(link => !link.id)
    const existingLinks = links.filter(link => link.id)
    
    console.log(`📝 Processing ${newLinks.length} new links and ${existingLinks.length} existing links`)
    
    // Process creates and updates in parallel
    const [created, updated] = await Promise.all([
      newLinks.length > 0 ? createLinksBatch(newLinks) : Promise.resolve([]),
      existingLinks.length > 0 ? updateLinksBatch(existingLinks) : Promise.resolve([])
    ])
    
    const endTime = performance.now()
    console.log(`🎉 Batch save completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    return { created, updated };
  } catch (error) {
    console.error('❌ Error in batch save operation:', error);
    return { created: [], updated: [] };
  }
}

// Helper function to update multiple links (for backward compatibility)
export async function updateLinks(links: LinkEntry[]): Promise<boolean> {
  try {
    // For now, we'll update each link individually
    // In a production app, you might want to use a batch update endpoint
    for (const link of links) {
      if (link.id) {
        await updateLink(link);
      } else {
        // If no ID, it's a new link
        await createLink({ name: link.name, url: link.url });
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Error updating links in Supabase:', error);
    return false;
  }
}
