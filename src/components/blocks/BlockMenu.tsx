'use client';

import { useEffect, useRef, useState } from 'react';
import { BlockType } from './types';

interface BlockMenuProps {
  onSelectBlockType: (type: BlockType) => void;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

export default function BlockMenu({ onSelectBlockType, position, onClose }: BlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const blockTypes: { type: BlockType; label: string; icon: string }[] = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'todo', label: 'To-do List', icon: '✓' },
  ];
  
  // Filter block types based on search query
  const filteredBlockTypes = blockTypes.filter(
    block => block.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Focus input when menu opens
  useEffect(() => {
    if (position && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [position]);
  
  // Handle clicking outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  if (!position) return null;
  
  return (
    <div
      ref={menuRef}
      className="absolute bg-neutral-900 border border-neutral-800 rounded-md shadow-xl w-64 z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-2 border-b border-neutral-800">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 bg-neutral-800 rounded text-neutral-200 focus:outline-none"
        />
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {filteredBlockTypes.map((blockType) => (
          <div
            key={blockType.type}
            className="p-3 hover:bg-neutral-800 cursor-pointer flex items-center"
            onClick={() => {
              onSelectBlockType(blockType.type);
              onClose();
            }}
          >
            <div className="w-6 h-6 flex items-center justify-center mr-3 text-neutral-400">
              {blockType.icon}
            </div>
            <div className="text-neutral-200">{blockType.label}</div>
          </div>
        ))}
        
        {filteredBlockTypes.length === 0 && (
          <div className="p-4 text-neutral-400 text-center">
            No blocks match your search
          </div>
        )}
      </div>
    </div>
  );
}