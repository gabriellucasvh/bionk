// src/types/global.d.ts

declare namespace JSX {
  interface IntrinsicElements {
    // Elementos HTML padrão. O React geralmente lida com isso, mas pode ser estendido.
    [elemName: string]: any;
  }
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode;
  }
  interface ElementAttributesProperty { props: {}; }
  interface ElementChildrenAttribute { children: {}; }
}