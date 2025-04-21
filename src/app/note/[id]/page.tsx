'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ObjectId } from 'mongodb';
import BlockEditor from '@/components/blocks/BlockEditor';
import { BlockData } from '@/components/blocks/types';
import { v4 as uuidv4 } from 'uuid';

interface Note {
  _id?: string;
  title: string;
  content: BlockData[] | string;
  updatedAt?: Date;
  createdAt?: Date;
}

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  
  const [note, setNote] = useState<Note>({ title: '', content: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      setLoading(true);
      
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load note');
        }
        
        const data = await response.json();
        let noteContent = data.note.content;
        
        // Convert string content to blocks if needed
        if (typeof noteContent === 'string') {
          // Create text blocks from content string
          const blocks: BlockData[] = noteContent ? 
            [{ id: uuidv4(), type: 'text', content: noteContent }] : 
            [{ id: uuidv4(), type: 'text', content: '' }];
          
          noteContent = blocks;
        } else if (!Array.isArray(noteContent)) {
          // Initialize with empty block if content is missing or invalid
          noteContent = [{ id: uuidv4(), type: 'text', content: '' }];
        }

        setNote({
          ...data.note, 
          content: noteContent
        });
      } catch (error) {
        console.error('Error loading note:', error);
        setError('Failed to load note');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNote();
  }, [noteId]);
  
  // Handle auto-save with useCallback to prevent infinite loops
  const saveNote = useCallback(async (updatedNote: Note) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedNote,
          _id: noteId,
          updatedAt: new Date()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [noteId]);
  
  // Debounced auto-save function with useCallback
  const debouncedSave = useCallback((updatedNote: Note) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(updatedNote);
    }, 1000); // 1 second delay before saving
  }, [saveNote]);
  
  // Handle block content changes with auto-save
  const handleBlocksChange = useCallback((blocks: BlockData[]) => {
    setNote(prevNote => {
      const updatedNote = { ...prevNote, content: blocks };
      debouncedSave(updatedNote);
      return updatedNote;
    });
  }, [debouncedSave]);
  
  // Handle title edit mode toggle
  const handleTitleClick = () => {
    setEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };
  
  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prevNote => ({ ...prevNote, title: e.target.value }));
  };
  
  // Handle title save on blur or enter key
  const handleTitleSave = useCallback(() => {
    setEditingTitle(false);
    debouncedSave(note);
  }, [debouncedSave, note]);
  
  // Handle title keydown (save on Enter)
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-4 bg-red-100 border-red-400 text-red-700 mb-6 rounded">
          {error}
          <button 
            className="ml-4 px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-300 rounded" 
            onClick={() => router.push('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-b-neutral-800 p-4 bg-neutral-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center border border-neutral-800 px-3 py-1 mr-6 hover:bg-neutral-800 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </Link>
            
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={note.title}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="border-b border-b-transparent focus:border-neutral-800 px-2 py-1 text-lg font-medium focus:outline-none min-w-[200px] bg-transparent text-white"
                placeholder="Untitled Note"
              />
            ) : (
              <h1 
                className="text-lg font-medium cursor-pointer hover:bg-neutral-800 px-2 py-1 rounded text-white"
                onClick={handleTitleClick}
              >
                {note.title || "Untitled Note"}
              </h1>
            )}
          </div>
          
          <div className="flex items-center text-sm text-neutral-500">
            {isSaving ? 'Saving...' : 'All changes saved'}
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-grow p-4 md:p-10 bg-neutral-950 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <BlockEditor 
            initialBlocks={Array.isArray(note.content) ? note.content : []}
            onChange={handleBlocksChange}
          />
        </div>
      </main>
    </div>
  );
}