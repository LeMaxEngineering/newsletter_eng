import type { ReactNode } from 'react';
export interface PanelProps {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}
export declare function Panel({ title, description, actions, children }: PanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Panel.d.ts.map