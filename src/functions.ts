import React from "react";

import { DISABLEABLE_ELEMENTS } from "./constants";
import { HasChildren, PartialElementProps } from "./types";

export function unique() {
  const seen: any[] = [];
  return (value: unknown) => {
    if (!seen.includes(value)) {
      seen.push(value);
      return true;
    }
    return false;
  };
}

export function uniqueClasses(className: string) {
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
    className,
    disabled,
    allowEventHandlersWhileDisabled,
    data,
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
    if (!allowEventHandlersWhileDisabled) {
      Object.keys(incomingProps)
        .filter((propKey) => propKey.startsWith("on"))
        .forEach((propKey) => delete props[propKey]);
    }
  }
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      props[`data-${key}`] = value;
    });
  }

  return React.createElement(tag, props, children);
}
