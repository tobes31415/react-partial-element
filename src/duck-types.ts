/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import { PartialElement } from "./PartialElement";
import { PartialElementPortal } from "./PartialElementPortal";

export function isReactFalsy(value: any) {
  return (
    value === false || value === null || value === undefined || value === ""
  );
}

export function isPartialElement(children: any) {
  return typeof children === "object" && children.type === PartialElement;
}

export function isPartialElementPortal(children: any) {
  return typeof children === "object" && children.type === PartialElementPortal;
}

export function isPrimitiveDataType(value: any) {
  const t = typeof value;
  return t === "string" || t === "number";
}

export function isFragment(children: any) {
  return typeof children === "object" && children.type === React.Fragment;
}

export function isArray(children: any) {
  return Array.isArray(children);
}

export function isDomElement(children: any) {
  return typeof children === "object" && typeof children.type === "string";
}

export function isLambdaComponent(children: any) {
  return (
    typeof children === "object" &&
    typeof children.type === "function" &&
    typeof children.props !== "undefined"
  );
}

export function isContextProvider(children: any) {
  return (
    typeof children === "object" &&
    typeof children.type === "object" &&
    typeof children.props === "object" &&
    !!children.props.children
  );
}

export function isForwardRef(children: any) {
  return (
    typeof children === "object" &&
    typeof children.type === "object" &&
    typeof children.type.render === "function"
  );
}
