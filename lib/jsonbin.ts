'use client';

export type LinkEntry = {
  name: string;
  url: string;
};

export async function fetchLinks(): Promise<LinkEntry[]> {
  try {
    const res = await fetch('/api/links');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching links from JSONBin:', error);
    return [];
  }
}

export async function updateLinks(links: LinkEntry[]): Promise<boolean> {
  try {
    const res = await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    });
    return res.ok;
  } catch (error) {
    console.error('❌ Error updating links in JSONBin:', error);
    return false;
  }
}