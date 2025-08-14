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
