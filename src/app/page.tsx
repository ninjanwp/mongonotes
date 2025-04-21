'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define note type
interface Note {
  _id?: string;
  title: string;
  content: string;
  updatedAt?: Date;
  [key: string]: any;
}

export default function Home() {
  const [collection, setCollection] = useState<string>("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setCollection(data.collection || "notes");
      setNotes(data.data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };
  
  // Load notes on initial render
  useEffect(() => {
    fetchNotes();
  }, []);
  
  // Create new note and navigate to it
  const createNewNote = async () => {
    try {
      const newNote = {
        title: "Untitled Note",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      
      if (!response.ok) throw new Error('Failed to create note');
      
      const result = await response.json();
      router.push(`/note/${result.id}`);
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note');
    }
  };
  
  // Delete note
  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      // Refresh notes list
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  // Get excerpt from content
  const getExcerpt = (content: any, maxLength: number = 100) => {
    // If content is empty, return empty string
    if (!content) return '';
    
    // Handle string content (backward compatibility)
    if (typeof content === 'string') {
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength) + '...';
    }
    
    // Handle array of blocks (new format)
    if (Array.isArray(content)) {
      // Extract text from the first text block or any block's content
      let extractedText = '';
      
      for (const block of content) {
        if (block.type === 'text' && typeof block.content === 'string') {
          extractedText = block.content;
          break;
        } else if (block.type === 'heading' && block.content && typeof block.content.text === 'string') {
          extractedText = block.content.text;
          break;
        } else if (block.type === 'todo' && block.content && typeof block.content.text === 'string') {
          extractedText = block.content.text;
          break;
        }
      }
      
      if (extractedText.length <= maxLength) return extractedText;
      return extractedText.substring(0, maxLength) + '...';
    }
    
    // For other types, return empty string
    return '';
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Notes Collection: {collection}</h1>
        <button 
          onClick={createNewNote}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Note
        </button>
      </header>
      
      {error && (
        <div className="p-4 bg-red-100 border-red-400 text-red-700 mb-6 rounded">
          {error}
          <button 
            className="ml-2 text-sm underline" 
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Notes Grid */}
      <div>
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V4c0-1.1.9-2 2-2h10a2 2 0 012 2v10m2 4h-3v-3" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-4">Create your first note to get started</p>
            <button 
              onClick={createNewNote}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              Create a note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <Link 
                key={note._id} 
                href={`/note/${note._id}`}
                className="block border border-neutral-800 rounded-lg overflow-hidden hover:shadow-md transition duration-200 bg-neutral-900 h-[200px] relative"
              >
                <div className="p-5 h-full flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg mb-2 truncate flex-grow">{note.title || "Untitled Note"}</h3>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const menu = document.getElementById(`menu-${note._id}`);
                          menu?.classList.toggle('hidden');
                        }}
                        className="p-1 rounded-full text-neutral-500 cursor-pointer hover:text-neutral-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      <div 
                        id={`menu-${note._id}`} 
                        className="hidden absolute right-0 top-full mt-1 bg-neutral-950 shadow-lg rounded-md z-10 border border-neutral-800"
                      >
                        <ul>
                          <li>
                            <button 
                              onClick={(e) => deleteNote(note._id!, e)} 
                              className="flex items-center px-4 py-2 text-red-400 w-full text-left cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-hidden">
                    <p className="text-neutral-500 text-sm line-clamp-4">
                      {getExcerpt(note.content)}
                    </p>
                  </div>
                  
                  <div className="text-xs text-neutral-500 mt-2">
                    {note.updatedAt && formatDate(note.updatedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
