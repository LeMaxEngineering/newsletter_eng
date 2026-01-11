export type BlockCategory = 'structure' | 'content' | 'interactive' | 'commerce';
export type BlockFieldType = 'string' | 'text' | 'richtext' | 'url' | 'image' | 'color' | 'select' | 'number';
export interface BlockFieldOption {
    label: string;
    value: string;
}
export interface BlockField {
    name: string;
    label: string;
    type: BlockFieldType;
    required?: boolean;
    placeholder?: string;
    defaultValue?: unknown;
    options?: BlockFieldOption[];
    helperText?: string;
}
export interface BlockMeta {
    title: string;
    description?: string;
    icon: string;
}
export interface BlockDefinition<TConfig extends Record<string, unknown> = Record<string, unknown>> {
    kind: string;
    category: BlockCategory;
    version: string;
    meta: BlockMeta;
    fields: BlockField[];
    defaults: TConfig;
}
export interface BlockInstance<TConfig extends Record<string, unknown> = Record<string, unknown>> {
    id: string;
    kind: string;
    version: string;
    config: TConfig;
}
//# sourceMappingURL=types.d.ts.map