import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Get all notes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("mongonotes");
    
    const collection = db.collection("notes");
    const notes = await collection.find({}).limit(20).toArray();
    
    return NextResponse.json({ 
      collection: "notes",
      data: notes
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// Create a new note
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("mongonotes");
    const collection = db.collection("notes");
    
    const result = await collection.insertOne(body);
    
    return NextResponse.json({ 
      success: true,
      id: result.insertedId 
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

// Update a note
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("mongonotes");
    const collection = db.collection("notes");
    
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

// Delete a note
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("mongonotes");
    const collection = db.collection("notes");
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}