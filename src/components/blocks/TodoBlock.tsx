'use client';

import { useRef, useEffect } from 'react';
import { TodoBlock as TodoBlockType } from './types';

interface TodoBlockProps {
  block: TodoBlockType;
  onChange: (block: TodoBlockType) => void;
  onKeyDown: (e: React.KeyboardEvent, blockId: string) => void;
  onFocus: () => void;
  isActive: boolean;
}

export default function TodoBlock({ block, onChange, onKeyDown, onFocus, isActive }: TodoBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Ensure content is properly structured
  const todoContent = block.content && typeof block.content === 'object' 
    ? block.content 
    : { text: '', checked: false };
  
  // Auto-focus when block is active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...block,
      content: {
        ...todoContent,
        text: e.target.value
      }
    });
  };
  
  const handleCheckboxChange = () => {
    onChange({
      ...block,
      content: {
        ...todoContent,
        checked: !todoContent.checked
      }
    });
  };

  return (
    <div className={`p-1 flex items-start ${isActive ? 'ring-1 ring-blue-400 rounded' : ''}`}>
      <div className="flex items-center h-8 pt-2 pr-2">
        <input
          type="checkbox"
          checked={!!todoContent.checked}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 checked:bg-blue-500 hover:cursor-pointer"
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`flex-grow p-2 bg-transparent focus:outline-none ${todoContent.checked ? 'line-through text-neutral-400' : 'text-neutral-200'}`}
        value={todoContent.text || ''}
        onChange={handleTextChange}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        onFocus={onFocus}
        placeholder="To-do item"
      />
    </div>
  );
}