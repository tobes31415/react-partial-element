import { createFinalElement } from "./functions";
import { HasChildren, PartialElementProps } from "./types";

/**
 * Forces a real dom node to be realized into this location, and then pass the children onto that new node
 */
export const PartialElementPortal = (
  props: PartialElementProps & HasChildren
) => {
  return createFinalElement(props);
};
