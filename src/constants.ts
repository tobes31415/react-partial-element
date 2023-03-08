import { MergeStrategies } from "./types";

export const PartialElementMergeStrategies: Record<string, MergeStrategies> = {
  className: "concatenateCssClass",
  data: "mergeObject",
  debugName: "concatenateString",
};

export const DISABLEABLE_ELEMENTS = ["input", "button"];
