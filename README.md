# react-partial-element

Gives your react projects the ability to create composable pieces of dom elements that let you specify properties such as class names and event handlers that merged into a single dom node at run time. Combine this with Atomic Design principles to create an easy to maintain design system for your application.

# Quick Example

```
<PartialElement className="foo">
   <PartialElement className="bar">
      <PartialElement className="baz">
         <PartialElement element="section">
             Hello World...
```

Results in the following dom element being created

```
<section class="foo bar baz">Hello World</section>
```

# How to use the Components

| ComponentName        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PartialElement       | All adjacent partial element nodes will be collapsed into a single resulting dom node. A Partial Element collapses into a singular dom element when it encounters any dom nodes, rendering primitives such as strings or numbers, Fragments, arrays of children, or a PartialElementPortal Component. Partial Elements are still considered Adjacent if they are returned from your custom components as long as no other dom nodes get emitted between them. |
| PartialElementPortal | Entirely optional. It's equivalent to using PartialElement except that it marks the end of the PartialElement chain and forces a dom node to be created at exactly that location. It's situationally useful for when you're working with nested components and want more control over the rendered output for styling reasons.                                                                                                                                |

# Merge Strategies

When partial elements try to set the same property, the following strategies are used to resolve the conflict.

| Name                | Effect                                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| replace             | The value closest to the leaf node will be used.                                                                                                                                    |
| concatenateString   | The values will be appended with a space delimiter                                                                                                                                  |
| concatenateCssClass | The values will be treated as a list of classes, only unique classes will be emitted, and any extra whitespace will be removed                                                      |
| mergeObject         | The two objects will be joined via a shallow merge. The values closest to the leaf node will be used in the event of a key conflict.                                                |
| appendArray         | The value will be treated as a javascript array and the new items appended to the end of the array                                                                                  |
| functionChain       | The functions will be called sequentially starting from the node closest to the leaf node. If the event property cancelBubble is set to true then the chain will stop at that point |

# Specific Strategies

Here is a list of which specific strategies are used for which properties

| Property  | Strategy Used       |
| --------- | ------------------- |
| className | concatenateCssClass |
| on\*\*\*  | functionChain       |
| default   | replace             |

You can override these behaviours by importing the PartialElementMergeStrategies object, and overriding the key corresponding to the property you wish to change and setting it to the name of a merge strategy as listed in the previous section. This will be a global change for your project as allowing the merge strategy to differ from element to element would create confusing scenarios likely resulting in bugs so make sure that you think about the impacts before overriding the defaults.

# How do I get the element reference?

You can get the element reference by passing in a callback handler for onRef which will be invoked when the dom node is created. Alternatively you can pass in a React.MutableRefObject<HtmlElement> which will get updated automatically.

```
<PartialElement onRef={r => console.log("The new reference is ", r)}>...
```

```
const myElement = useRef<HtmlElement>();
<PartialElement onRef={myElement}>...
```

# Special props

| Property Name                   | effect                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| element                         | The name of the dom node that will get created. (default: "`div`")                                                                                                                                                                                                                                                  |
| disabled                        | The element will get the `disabled` attribute if it is an input or a button, otherwise it will get the `data-disabled` attribute. Additionally any `on***` attributes, with the exception of onRef, will be omitted unless you also specifiy allowEventHandlersWhileDisabled                                        |
| allowEventHandlersWhileDisabled | The partial element will emit the on\* event handlers even when disabled (default false)                                                                                                                                                                                                                            |
| unwrapFragments                 | Continues to unwrap the JSX tree even when it encounters a fragment. Note that this can cause issues with other libraries such as emotion for styling elements. Also note that even with the fragments unwrapped they must not contain an array of elements or it will trigger an automatic dom node to be inserted |
| onRef                           | Accepts either a callback function or a `React.MutableRefObject<HtmlElement>`. The callback function will be invoked with the dom reference. If you pass a ref object it will be updated with the dom reference                                                                                                     |

# A More Complex Example

Here is our desired dom tree. This example will show how to create it using logical HOCs. We can have the benefit of a clean dom while still also having the benefits of of compile time type checking.

```

<div class="page-layout">
    <aside class="side-bar custom-component two-row-layout">
        <div>Woof Woof</div>
        <div>Meow</div>
    </aside>
    <main class="main-layout">
        Body Content Here
    </main>
</div>
```

Here is how to achieve this using PartialElements

```

/**
 * Here we have an app that uses a layout component called AppScaffold to handle the page layout
 * while passing in the specific business elements as an implementation of the Atomic Design pattern.
 */
const MyApp = () => (
  <AppScaffold
    sideBar={<CustomComponent dog={"Woof Woof"} cat={"Meow"} />}
    main={<DemoSectionLayout>Body Content Here</DemoSectionLayout>}
  />
);

/**
 * Layout Components can use PartialElementPortal to ensure a dom node is emitted where they expect
 * while setting any last minute properties such as css clases. This layout component uses slots,
 * we use PartialElement around those slots to allow us to decorate the slot while still allowing
 * it to collapse with any other partials that may be included when the slot is filled
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
 * Layout Components should have minimal logic, but you could for instance, verify if the correct
 * number of child elements were passed in.  This makes your code easier to reuse by seperating
 * the presentation and business logic.
 */
const DemoSectionLayout = ({ children }: { children: React.ReactNode }) => {
  if (!children || (Array.isArray(children) && children.length !== 1)) {
    throw new Error("This Layout requires exactly one child element");
  }
  return <PartialElement className="main-layout">{children}</PartialElement>;
};

/**
 * Your custom components can emit Partials and can even further embed other sub components like
 * layouts.  All Adjacent PartialElements will be collapsed making for a nice clean dom.
 */
const CustomComponent = ({
  dog,
  cat,
}: {
  dog: React.ReactNode;
  cat: React.ReactNode;
}) => (
  <PartialElement className="custom-component">
    <TwoRowLayout top={dog} bottom={cat} />
  </PartialElement>
);

/**
 * Here is another example of a reusable layout element that has slotted names. In this example
 * we don't care to add any extra properties, we're just enforcing that there will be exactly
 * two elements as children of this layout.  Consider if we emitted the top and bottom directly
 * but then one of those slots was a fragment with two or more children, the result would be 3
 * or more elements under this node which may break your styles.  The use of partial element
 * allows us this guarentee of cardinality without creating superluous nodes in the dom.
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
