import React from "react";
import { createFinalElement } from "./functions";

/**
 * Forces a real dom node to be realized into this location, and then pass the children onto that new node
 */
export const PartialElementPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const state = {};
  return createFinalElement({ ...state, children });
};
