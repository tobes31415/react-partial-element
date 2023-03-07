# react-partial-element

Gives your react projects the ability to create composable partial elements that let you specify properties such as class name that merged into a single dom node at run time. Combine this with Atomic Design principles to create an easy to maintain design system for your application.

# Usage

PartialElement - All adjacent partial element nodes will be collapsed into a single resulting dom node. Each Partial Element collapses into a singular element when it encounters a PartialElementPortal, or if it encounters any dom nodes, rendering primitives, or any array of children. Partial Elements are still considered Adjacent if they are returned from your custom components as long as no other dom nodes get emitted between them.

PartialElementPortal - Guarentees that regardless of what happened above this point in the JSX tree that a single dom node will be emitted at exactly this location. Useful for when you're working with slotted templates and want more control over the rendered output

# Example

Check out this dom tree, We can create this using logical HOC, and still benefitting from typescript's type checking!

```
<div class="page-layout">
    <aside class="side-bar custom-component two-row-layout">
        <div>Top Row</div>
        <div>Bottom Row</div>
    </aside>
    <main class="main-layout">
        Body Content Here
    </main>
</div>
```

Here is how to achieve this using PartialElements

```

/**
 * App designed with logical component blocks according to atomic design
 */
const MyApp = () => (
  <AppScaffold
    sideBar={<CustomComponent top={"Top Row"} bottom={"Bottom Row"} />}
    main={<DemoPageLayout>Body Content Here</DemoPageLayout>}
  />
);

/**
 * Layout Elements use PartialElementPortal to ensure a dom node is emitted where they expect, and PartialElement to allow slotted children to collapse
 */
const AppScaffold = ({
  sideBar,
  main,
}: {
  sideBar: React.ReactNode;
  main: React.ReactNode;
}) => (
  <PartialElementPortal className="page-layout">
    <PartialElement element="aside" className="side-bar">
      {sideBar}
    </PartialElement>
    <PartialElement element="main">{main}</PartialElement>
  </PartialElementPortal>
);

/**
 * You can use typescript to validate the cardinality of children matches what's expected for your layouts without cluttering up the dom with superfluous nodes
 */
const DemoPageLayout = ({ children }: { children: React.ReactNode }) => (
  <PartialElement className="main-layout">{children}</PartialElement>
);

/**
 * Your custom components can emit Partials and can even further embed other sub components like layouts, all will be collapsed
 */
const CustomComponent = ({
  top,
  bottom,
}: {
  top: React.ReactNode;
  bottom: React.ReactNode;
}) => (
  <PartialElement className="custom-component">
    <TwoRowLayout top={top} bottom={bottom} />
  </PartialElement>
);

/**
 * Here is another example of a reusable layout element that has slotted names and yet emits a collapsed dom strucutre.
 */
const TwoRowLayout = ({
  top,
  bottom,
}: {
  top: React.ReactNode;
  bottom: React.ReactNode;
}) => (
  <PartialElementPortal className="two-row-layout">
    <PartialElement>{top}</PartialElement>
    <PartialElement>{bottom}</PartialElement>
  </PartialElementPortal>
);

```
