// src/App.js
import React from "react";
import { MDXProvider } from "@mdx-js/react";
import Hello from "../content/hello.md";

const Element = props => {
  return <p {...props} />;
};

const components = {
  h1: Element,
  h2: Element,
  p: Element,
  code: Element,
  inlineCode: Element
};
export default props => (
  <MDXProvider components={components}>
    <Hello />
    <main {...props} />
  </MDXProvider>
);
