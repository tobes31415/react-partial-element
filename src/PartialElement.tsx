import { rewriteJSXTree } from "./functions";
import { PartialElementProps } from "./types";

/**
 * A virtual dom node that passes properties to the next realized dom node, whatever that might be.  Some properties such as className and data are merged, while most others last-in-wins
 */
export const PartialElement = (props: PartialElementProps) => {
  const { children, ...newProps } = props;

  return rewriteJSXTree(children, newProps);
};
