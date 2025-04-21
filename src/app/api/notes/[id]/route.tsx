import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Get a specific note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js App Router, params is not a promise, so we can use it directly
    const id = params.id;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("mongonotes");
    const collection = db.collection("notes");
    
    const note = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ note });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}