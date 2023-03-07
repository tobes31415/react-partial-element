export interface PartialElementProps extends React.HTMLAttributes<HTMLElement> {
  element?: string;
  data?: Record<string, string>;
  disabled?: boolean;
  allowEventHandlersWhileDisabled?: boolean;
  unwrapFragments?: boolean;
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
