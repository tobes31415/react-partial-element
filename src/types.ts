export interface PartialElementProps extends React.HTMLAttributes<HTMLElement> {
  element?: string;
  data?: Record<string, string>;
  disabled?: boolean;
  singleElement?: boolean;
  debugName?: string;
}
export type PropKey = keyof PartialElementProps;

export interface HasChildren {
  children: React.ReactNode;
}

export type MergeStrategies =
  | "replace"
  | "concatenateString"
  | "mergeObject"
  | "appendArray";
