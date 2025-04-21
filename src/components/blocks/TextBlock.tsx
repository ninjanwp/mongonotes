'use client';

import { useState, useRef, useEffect } from 'react';
import { TextBlock as TextBlockType } from './types';

interface TextBlockProps {
  block: TextBlockType;
  onChange: (block: TextBlockType) => void;
  onKeyDown: (e: React.KeyboardEvent, blockId: string) => void;
  onFocus: () => void;
  isActive: boolean;
}

// Size of a tab in spaces - can be adjusted
const TAB_SIZE = 2;

export default function TextBlock({ block, onChange, onKeyDown, onFocus, isActive }: TextBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea on content change
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [block.content]);
  
  // Auto-focus when block is active
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...block,
      content: e.target.value
    });
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = textarea.value;
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent focus movement
      
      // Insert tab or remove tab on shift+tab
      if (!e.shiftKey) {
        // Insert a tab at cursor position
        const tabSpaces = ' '.repeat(TAB_SIZE);
        const newContent = content.substring(0, start) + tabSpaces + content.substring(end);
        
        onChange({
          ...block,
          content: newContent
        });
        
        // Set cursor position after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + TAB_SIZE;
        }, 0);
      } else {
        // Handle shift+tab: remove indentation from start of line
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const lineBeforeCursor = content.substring(lineStart, start);
        
        // Check if there are spaces to remove
        const spacesToRemove = Math.min(
          TAB_SIZE,
          lineBeforeCursor.length - lineBeforeCursor.trimStart().length
        );
        
        if (spacesToRemove > 0) {
          const newContent = 
            content.substring(0, lineStart) + 
            lineBeforeCursor.substring(spacesToRemove) + 
            content.substring(start);
          
          onChange({
            ...block,
            content: newContent
          });
          
          // Adjust cursor position
          setTimeout(() => {
            const newPosition = Math.max(lineStart, start - spacesToRemove);
            textarea.selectionStart = textarea.selectionEnd = newPosition;
          }, 0);
        }
      }
      return;
    }
    
    // Handle Backspace to delete full tabs at once
    if (e.key === 'Backspace' && start === end) {
      // Only handle backspace when cursor is after a tab indentation
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const beforeCursor = content.substring(lineStart, start);
      
      // Check if cursor is right after tab-sized whitespace
      if (beforeCursor.length >= TAB_SIZE && 
          beforeCursor.endsWith(' '.repeat(TAB_SIZE)) && 
          // Ensure it's the start of the line or preceded by a tab boundary
          (start - lineStart === TAB_SIZE || (start - lineStart) % TAB_SIZE === 0)) {
        
        e.preventDefault(); // Prevent default backspace
        
        // Remove a full tab
        const newContent = 
          content.substring(0, start - TAB_SIZE) + 
          content.substring(start);
        
        onChange({
          ...block,
          content: newContent
        });
        
        // Adjust cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - TAB_SIZE;
        }, 0);
        
        return;
      }
      
      // If content is empty, delete the block
      if (content === '') {
        onKeyDown(e, block.id);
        return;
      }
    }
    
    // Handle other special keys
    if ((e.key === 'Enter' && e.shiftKey) || 
        (e.key === '/' && content === '')) {
      onKeyDown(e, block.id);
    }
  };

  return (
    <div className='border border-transparent hover:border-neutral-800 active:border-neutral-800 p-1 flex items-start rounded'>
      <textarea
        ref={textareaRef}
        className="w-full resize-none p-2 bg-transparent text-neutral-200 focus:outline-none min-h-[1.5em]"
        value={typeof block.content === 'string' ? block.content : ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder="Type your text here..."
        style={{
          overflow: 'hidden',
          height: 'auto'
        }}
      />
    </div>
  );
}