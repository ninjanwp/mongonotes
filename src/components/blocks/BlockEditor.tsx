'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Block, BlockData, BlockType } from './types';
import BlockRenderer from './BlockRenderer';
import BlockMenu from './BlockMenu';

interface BlockEditorProps {
  initialBlocks?: BlockData[];
  onChange: (blocks: BlockData[]) => void;
}

export default function BlockEditor({ initialBlocks = [], onChange }: BlockEditorProps) {
  // If no initial blocks, create a default text block
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    if (initialBlocks.length > 0) return initialBlocks;
    return [
      {
        id: uuidv4(),
        type: 'text',
        content: ''
      }
    ];
  });
  
  const [activeBlockId, setActiveBlockId] = useState<string | null>(
    blocks.length > 0 ? blocks[0].id : null
  );
  
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [targetIndex, setTargetIndex] = useState<number>(-1);
  
  // Track last selection position for inserting new blocks
  const lastCaretPositionRef = useRef<number>(0);
  
  // State to show/hide the block type toolbar
  const [showBlockTypes, setShowBlockTypes] = useState(false);
  
  // Prevent infinite loop by using useCallback and proper dependencies
  const updateBlocksCallback = useCallback((newBlocks: BlockData[]) => {
    onChange(newBlocks);
  }, [onChange]);
  
  // Update parent component when blocks change
  useEffect(() => {
    updateBlocksCallback(blocks);
  }, [blocks, updateBlocksCallback]);
  
  // Handle block changes
  const updateBlock = (updatedBlock: BlockData) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  };
  
  // Create a new block based on type
  const createBlock = (type: BlockType, index: number): BlockData => {
    switch (type) {
      case 'text':
        return { id: uuidv4(), type, content: '' };
      case 'todo':
        return { id: uuidv4(), type, content: { text: '', checked: false } };
      default:
        return { id: uuidv4(), type: 'text', content: '' };
    }
  };
  
  // Add a new block
  const addBlock = (type: BlockType, index: number) => {
    const newBlock = createBlock(type, index);
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    setBlocks(updatedBlocks);
    setActiveBlockId(newBlock.id);
    setShowBlockTypes(false); // Hide the block types after adding
  };
  
  // Handle key commands
  const handleBlockKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    
    if (e.key === 'Enter' && e.shiftKey) {
      // Create a new block below when Shift+Enter is pressed
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const currentNode = range.startContainer;
        const currentOffset = range.startOffset;
        
        // Save the current position for potential content splitting
        lastCaretPositionRef.current = currentOffset;
      }
      
      addBlock('text', currentIndex);
    } else if (e.key === 'Backspace') {
      const currentBlock = blocks[currentIndex];
      
      // For text blocks, check if content is empty
      if (
        currentBlock.type === 'text' && 
        typeof currentBlock.content === 'string' && 
        currentBlock.content === '' && 
        blocks.length > 1
      ) {
        e.preventDefault();
        deleteBlock(currentIndex);
        
        // Set focus to previous block if exists
        if (currentIndex > 0) {
          setActiveBlockId(blocks[currentIndex - 1].id);
        }
      }
    } else if (e.key === '/' && (
      (blocks[currentIndex].type === 'text' && blocks[currentIndex].content === '') || 
      e.currentTarget.textContent === ''
    )) {
      e.preventDefault();
      // Show block menu for adding different block types
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.top + window.scrollY + 20, left: rect.left });
      setTargetIndex(currentIndex);
    }
  };
  
  // Delete a block
  const deleteBlock = (index: number) => {
    if (blocks.length === 1) return; // Don't delete the last block
    
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index, 1);
    setBlocks(updatedBlocks);
    
    // Update active block
    if (index >= updatedBlocks.length) {
      setActiveBlockId(updatedBlocks[updatedBlocks.length - 1].id);
    } else {
      setActiveBlockId(updatedBlocks[index].id);
    }
  };
  
  // Handle selecting block type from menu
  const handleSelectBlockType = (type: BlockType) => {
    if (targetIndex >= 0) {
      // Replace the current block with the new type
      const updatedBlocks = [...blocks];
      const newBlock = createBlock(type, targetIndex);
      updatedBlocks[targetIndex] = newBlock;
      setBlocks(updatedBlocks);
      setActiveBlockId(newBlock.id);
    }
  };
  
  // Toggle block type toolbar
  const toggleBlockTypes = () => {
    setShowBlockTypes(!showBlockTypes);
  };
  
  // Array of available block types with icons
  const blockTypeButtons = [
    { type: 'text', icon: 'text', label: 'Text' },
    { type: 'heading', icon: 'heading', label: 'Heading' },
    { type: 'todo', icon: 'check-square', label: 'To-Do' },
    { type: 'table', icon: 'grid', label: 'Table' }
  ];
  
  // Handle mouse click to add a block at the end
  const handleAddBlockClick = () => {
    addBlock('text', blocks.length - 1);
  };
  
  return (
    <div className="block-editor">
      {/* Blocks */}
      <div className="space-y-3">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onChange={updateBlock}
            onKeyDown={handleBlockKeyDown}
            onFocus={() => setActiveBlockId(block.id)}
            isActive={block.id === activeBlockId}
            onDelete={() => {
              const index = blocks.findIndex(b => b.id === block.id);
              deleteBlock(index);
            }}
          />
        ))}
        
        {/* Add Block Button and Block Types Toolbar */}
        <div className="py-4">
          {!showBlockTypes ? (
            <button
              onClick={toggleBlockTypes}
              className="flex items-center text-neutral-400 hover:text-neutral-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add a block
            </button>
          ) : (
            <div className="flex flex-wrap gap-2 items-center py-2">
              {/* Text block */}
              <button 
                onClick={() => addBlock('text', blocks.length - 1)}
                className="flex flex-col items-center p-2 rounded hover:bg-neutral-800 transition-colors"
                title="Text"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
                  <path d="M17 6.1H3"></path>
                  <path d="M21 12.1H3"></path>
                  <path d="M15.1 18H3"></path>
                </svg>
                <span className="text-xs mt-1 text-neutral-400">Text</span>
              </button>
              
              {/* Todo block */}
              <button 
                onClick={() => addBlock('todo', blocks.length - 1)}
                className="flex flex-col items-center p-2 rounded hover:bg-neutral-800 transition-colors"
                title="To-Do"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
                  <rect x="3" y="5" width="16" height="16" rx="2"></rect>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                <span className="text-xs mt-1 text-neutral-400">To-Do</span>
              </button>
              
              {/* Cancel button */}
              <button 
                onClick={() => setShowBlockTypes(false)}
                className="flex flex-col items-center p-2 ml-2 rounded hover:bg-neutral-800 transition-colors"
                title="Cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span className="text-xs mt-1 text-neutral-400">Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Block Type Menu */}
      <BlockMenu
        onSelectBlockType={handleSelectBlockType}
        position={menuPosition}
        onClose={() => {
          setMenuPosition(null);
          setTargetIndex(-1);
        }}
      />
    </div>
  );
}