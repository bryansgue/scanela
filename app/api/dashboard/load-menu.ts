import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error loading menu' }, { status: 500 });
  }
}
