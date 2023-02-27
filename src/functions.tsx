/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from "react";

import { DISABLEABLE_ELEMENTS, strategyMap } from "./constants";
import {
  isArray,
  isContextProvider,
  isDomElement,
  isForwardRef,
  isFragment,
  isLambdaComponent,
  isPartialElement,
  isPartialElementPortal,
  isPrimitiveDataType,
  isReactFalsy,
} from "./duck-types";
import { HasChildren, PartialElementProps, PropKey } from "./types";

export function mergePartialElementProps(
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
    switch (strategyMap[key]) {
      case "appendArray":
        return [...parentValue, ...newValue];
      case "concatenateString":
        return uniqueClasses(parentValue + " " + newValue);
      case "mergeObject":
        return Object.assign({}, parentValue, newValue);
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

function unique() {
  const seen: any[] = [];
  return (value: unknown) => {
    if (!seen.includes(value)) {
      seen.push(value);
      return true;
    }
    return false;
  };
}

function uniqueClasses(className: string) {
  return className.split(" ").filter(unique()).join(" ");
}

/**
 * Creates a working dom node from the given props.  Includes support for custom elements as well as disabling event handlers
 */
export function createFinalElement(
  incomingProps: PartialElementProps & HasChildren
) {
  const {
    element,
    children,
    disabled,
    data,
    singleElement,
    debugName,
    className,
    ...restOfProps
  } = incomingProps;
  const tag = element || "div";
  const isCustomElement = tag.includes("-");
  const props: any = { ...restOfProps };
  const normalizedClassName = (className ?? "").replaceAll(/\s\s/g, " ").trim();
  if (normalizedClassName.length > 0) {
    props[isCustomElement ? "class" : "className"] = normalizedClassName;
  }
  if (disabled) {
    props.disabled = "disabled";
    if (!isCustomElement && !DISABLEABLE_ELEMENTS.includes(tag)) {
      props["data-disabled"] = "";
    }
    Object.keys(incomingProps)
      .filter((propKey) => propKey.startsWith("on"))
      .forEach((propKey) => delete props[propKey]);
  }
  if (debugName) {
    props[`data-debug-names`] = debugName;
  }
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      props[`data-${key}`] = value;
    });
  }

  return React.createElement(tag, props, children);
}

export function rewriteJSXTree(
  children: React.ReactNode,
  state: PartialElementProps
): JSX.Element {
  const temp: any = children;
  (globalThis as any).temp = temp;
  if (isReactFalsy(temp)) {
    return <></>;
  } else if (isPrimitiveDataType(temp) || isArray(temp) || isDomElement(temp)) {
    return createFinalElement({ ...state, children: temp });
  } else if (isPartialElementPortal(temp)) {
    return createFinalElement({ ...state, children: temp.props.children });
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
