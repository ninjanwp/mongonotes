'use client';

import { Block, BlockData } from './types';
import TextBlock from './TextBlock';
import TodoBlock from './TodoBlock';

interface BlockRendererProps {
  block: BlockData;
  onChange: (block: BlockData) => void;
  onKeyDown: (e: React.KeyboardEvent, blockId: string) => void;
  onFocus: () => void;
  isActive: boolean;
  onDelete: () => void;
}

export default function BlockRenderer({ 
  block, 
  onChange, 
  onKeyDown, 
  onFocus, 
  isActive,
  onDelete 
}: BlockRendererProps) {
  // Render block based on type
  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            block={block}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            isActive={isActive}
          />
        );
      
      case 'todo':
        return (
          <TodoBlock
            block={block}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            isActive={isActive}
          />
        );
        
      // Add more block types here

      default:
        // This case should ideally be unreachable if all block types are handled.
        // If it's reached, it means BlockData has a type not covered in the switch.
        console.error("Unsupported block encountered:", block);
        return <div>Unsupported block type</div>;
    }
  };

  // A subtle hover effect to show block actions
  const blockHoverEffect = isActive
    ? 'bg-neutral-900/30'
    : 'hover:bg-neutral-900/20';

  return (
    <div className={`group relative rounded transition-colors p-1 ${blockHoverEffect}`}>
      {isActive && (
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDelete}
            className="text-neutral-500 hover:text-neutral-300"
            title="Delete block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
      {renderBlock()}
    </div>
  );
}