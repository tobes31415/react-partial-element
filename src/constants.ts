import { MergeStrategies } from "./types";

export const PartialElementMergeStrategies: Record<string, MergeStrategies> = {
  className: "concatenateCssClass",
};

export const DISABLEABLE_ELEMENTS = ["input", "button"];
