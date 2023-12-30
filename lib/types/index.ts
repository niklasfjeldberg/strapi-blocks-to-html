import type { VNode, Component } from 'vue';
// text
// ----------

export interface TextInlineNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export type Modifier = Exclude<keyof TextInlineNode, 'type' | 'text'>;

export type TextInlineProps = Omit<TextInlineNode, 'type'>;

// blocksRenderer
// ----------

interface LinkInlineNode {
  type: 'link';
  url: string;
  children: TextInlineNode[];
}

type DefaultInlineNode = TextInlineNode | LinkInlineNode;

interface ListItemInlineNode {
  type: 'list-item';
  children: DefaultInlineNode[];
}

// Inline node types
type NonTextInlineNode =
  | Exclude<DefaultInlineNode, TextInlineNode>
  | ListItemInlineNode;

interface ParagraphBlockNode {
  type: 'paragraph';
  children: DefaultInlineNode[];
}

interface QuoteBlockNode {
  type: 'quote';
  children: DefaultInlineNode[];
}

export interface CodeBlockNode {
  type: 'code';
  children: DefaultInlineNode[];
}

interface HeadingBlockNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: DefaultInlineNode[];
}

interface ListBlockNode {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: (ListItemInlineNode | ListBlockNode)[];
}

interface ImageBlockNode {
  type: 'image';
  image: {
    name: string;
    alternativeText?: string | null;
    url: string;
    caption?: string | null;
    width: number;
    height: number;
    formats?: Record<string, unknown>;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    previewUrl?: string | null;
    provider: string;
    provider_metadata?: unknown | null;
    createdAt: string;
    updatedAt: string;
  };
  children: [{ type: 'text'; text: '' }];
}

// Block node types
export type RootNode =
  | ParagraphBlockNode
  | QuoteBlockNode
  | CodeBlockNode
  | HeadingBlockNode
  | ListBlockNode
  | ImageBlockNode;

export type StrapiNode = RootNode | NonTextInlineNode;

// Util to convert a node to the props of the corresponding React component
export type GetPropsFromNode<T> = Omit<T, 'type' | 'children'> & {
  children?: VNode;
  // For code blocks, add a plainText property that is created by this renderer
  plainText?: T extends { type: 'code' } ? string : never;
};

// Map of all block types to their matching component
export type BlocksComponents = {
  [K in StrapiNode['type']]: Component<
    // Find the BlockProps in the union that match the type key of the current BlockNode
    // and use it as the component props
    GetPropsFromNode<Extract<Node, { type: K }>>
  >;
};

// Map of all inline types to their matching React component
export type ModifiersComponents = {
  // React.ComponentType
  [K in Modifier]: Component<{ children: VNode }>;
};

export interface ComponentsContextValue {
  blocks: BlocksComponents;
  modifiers: ModifiersComponents;
  missingBlockTypes: string[];
  missingModifierTypes: string[];
}

export type BlocksContent = RootNode[];

export interface BlocksRendererProps {
  content: BlocksContent;
  blocks?: Partial<BlocksComponents>;
  modifiers?: Partial<ModifiersComponents>;
}
