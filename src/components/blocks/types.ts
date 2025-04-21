// Types for block-based editor

export type BlockType = 'text' | 'heading' | 'todo' | 'table' | 'image';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
}

export interface TextBlock extends Block {
  type: 'text';
  content: string;
}

export interface HeadingBlock extends Block {
  type: 'heading';
  content: {
    text: string;
    level: 1 | 2 | 3;
  };
}

export interface TodoBlock extends Block {
  type: 'todo';
  content: {
    text: string;
    checked: boolean;
  };
}

export interface TableBlock extends Block {
  type: 'table';
  content: {
    rows: string[][];
  };
}

export interface ImageBlock extends Block {
  type: 'image';
  content: {
    src: string;
    alt: string;
    caption?: string;
  };
}

export type BlockData = TextBlock | HeadingBlock | TodoBlock | TableBlock | ImageBlock;