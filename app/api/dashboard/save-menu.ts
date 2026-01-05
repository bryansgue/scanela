import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error saving menu' }, { status: 500 });
  }
}
