import { MergeStrategies } from "./types";

export const strategyMap: Record<string, MergeStrategies> = {
  className: "concatenateString",
  data: "mergeObject",
  debugName: "concatenateString",
};

export const DISABLEABLE_ELEMENTS = ["input", "button"];
