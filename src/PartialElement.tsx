/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from "react";

import { PartialElementPortal } from "./PartialElementPortal";
import { PartialElementMergeStrategies } from "./constants";
import { createFinalElement, uniqueClasses } from "./functions";
import { PartialElementProps, PropKey } from "./types";

/**
 * A virtual dom node that passes properties to the next realized dom node, whatever that might be.  Some properties such as className and data are merged, while most others last-in-wins
 */
export const PartialElement = (props: PartialElementProps) => {
  const { children, ...newProps } = props;

  return rewriteJSXTree(children, newProps);
};

function rewriteJSXTree(
  children: React.ReactNode,
  state: PartialElementProps
): JSX.Element {
  const temp: any = children;
  (globalThis as any).temp = temp;
  if (isReactFalsy(temp)) {
    return <></>;
  } else if (
    isPrimitiveDataType(temp) ||
    isArray(temp) ||
    isDomElement(temp) ||
    (isFragment(temp) && !state.unwrapFragments)
  ) {
    return createFinalElement({ ...state, children: temp });
  } else if (isPartialElementPortal(temp)) {
    const { children: innerChildren, ...newProps } = temp.props;
    const mergedState = mergePartialElementProps(state, newProps);
    return createFinalElement({ ...mergedState, children: innerChildren });
  } else if (isPartialElement(temp)) {
    const { children: innerChildren, ...newProps } = temp.props;
    const mergedState = mergePartialElementProps(state, newProps);
    return rewriteJSXTree(innerChildren, mergedState);
  } else if (isFragment(temp)) {
    return rewriteJSXTree(temp.props.children as any, state);
  } else if (isLambdaComponent(temp)) {
    const nextLayer = temp.type(temp.props);
    return rewriteJSXTree(nextLayer, state);
  } else if (isForwardRef(temp)) {
    const nextLayer = temp.type.render(temp.props);
    return rewriteJSXTree(nextLayer, state);
  } else if (isContextProvider(temp)) {
    const swap = { ...temp };
    swap.props = { ...swap.props };
    swap.props.children = rewriteJSXTree(temp.props.children, state);
    return swap;
  } else {
    console.error("UNRECOGNIZED JSX ELEMENT PATTERN", temp);
    return <div>ERROR</div>;
  }
}

function mergePartialElementProps(
  parentState: PartialElementProps,
  newProps: PartialElementProps
): PartialElementProps {
  const childState: PartialElementProps = {
    ...parentState,
  };

  const applyMerge = (key: PropKey) => {
    const parentValue = parentState[key] as any;
    const newValue = (newProps as PartialElementProps)[key] as any;
    if (!parentValue) {
      return newValue;
    }
    if (!newValue) {
      return parentValue;
    }
    const strategy =
      PartialElementMergeStrategies[key] ??
      (key.startsWith("on") ? "functionChain" : "replace");
    switch (strategy) {
      case "appendArray":
        return [...parentValue, ...newValue];
      case "concatenateString":
        return parentValue + " " + newValue;
      case "concatenateCssClass":
        return uniqueClasses(parentValue + " " + newValue);
      case "mergeObject":
        return Object.assign({}, parentValue, newValue);
      case "functionChain":
        return createFunctionChain(parentValue, newValue);
      case "replace":
      default:
        return newValue;
    }
  };

  Object.keys(newProps).forEach((_key) => {
    const key = _key as PropKey;
    childState[key] = applyMerge(key);
  });
  return childState;
}

type DomEventHandler<E extends Event = Event, T = any> = (
  e: E,
  ...args: T[]
) => void;
function createFunctionChain(
  previousFn: DomEventHandler,
  currentFn: DomEventHandler
): DomEventHandler {
  return (e: any, ...args: any[]) => {
    currentFn(e, ...args);
    if (!e.cancelBubble) {
      previousFn(e, ...args);
    }
  };
}

function isReactFalsy(value: any) {
  return (
    value === false || value === null || value === undefined || value === ""
  );
}

function isPartialElement(children: any) {
  return typeof children === "object" && children.type === PartialElement;
}

function isPartialElementPortal(children: any) {
  return typeof children === "object" && children.type === PartialElementPortal;
}

function isPrimitiveDataType(value: any) {
  const t = typeof value;
  return t === "string" || t === "number";
}

function isFragment(children: any) {
  return typeof children === "object" && children.type === React.Fragment;
}

function isArray(children: any) {
  return Array.isArray(children);
}

function isDomElement(children: any) {
  return typeof children === "object" && typeof children.type === "string";
}

function isLambdaComponent(children: any) {
  return (
    typeof children === "object" &&
    typeof children.type === "function" &&
    typeof children.props !== "undefined"
  );
}

function isContextProvider(children: any) {
  return (
    typeof children === "object" &&
    typeof children.type === "object" &&
    typeof children.props === "object" &&
    !!children.props.children
  );
}

function isForwardRef(children: any) {
  return (
    typeof children === "object" &&
    typeof children.type === "object" &&
    typeof children.type.render === "function"
  );
}
