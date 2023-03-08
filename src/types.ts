export interface PartialElementProps extends React.HTMLAttributes<HTMLElement> {
  element?: string;
  data?: Record<string, string>;
  disabled?: boolean;
  allowEventHandlersWhileDisabled?: boolean;
  unwrapFragments?: boolean;
  onRef?:
    | ((ref: HTMLElement) => void)
    | React.MutableRefObject<HTMLElement | undefined>;
}
export type PropKey = keyof PartialElementProps;

export interface HasChildren {
  children: React.ReactNode;
}

export type MergeStrategies =
  | "replace"
  | "concatenateCssClass"
  | "concatenateString"
  | "mergeObject"
  | "appendArray"
  | "functionChain";
