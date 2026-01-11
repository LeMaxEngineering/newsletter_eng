import type { BlockDefinition } from '@neewsletter/block-schema';

export interface CanvasBlock {
  id: string;
  block: BlockDefinition;
}

type IdFactory = () => string;

const defaultIdFactory: IdFactory = () => `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export function addCanvasBlock(blocks: CanvasBlock[], block: BlockDefinition, idFactory: IdFactory = defaultIdFactory) {
  const entry: CanvasBlock = {
    id: idFactory(),
    block
  };

  return [...blocks, entry];
}

export function removeCanvasBlock(blocks: CanvasBlock[], blockId: string) {
  return blocks.filter((entry) => entry.id !== blockId);
}
