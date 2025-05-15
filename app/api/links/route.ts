import { NextResponse } from 'next/server';

const API_KEY = '$2a$10$XDYmb1Cw2r9mWaWPtAfsdOuEhXY6EiHXUvq9m5M8oFirKuXsm.wEi';
const BIN_ID = '6825688c8561e97a5014300f';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json.record);
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to update' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}