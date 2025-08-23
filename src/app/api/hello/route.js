// File: src/app/api/hello/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // You can do anything here:
  // - Connect to a database
  // - Call another API
  // - Read from a file

  const data = { message: 'Hello from the backend!' };

  return NextResponse.json(data);
}