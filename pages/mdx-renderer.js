import React, { createContext, useContext } from "react";
import { useMDXComponents, mdx } from "@mdx-js/react";

const GatsbyMDXScopeContext = createContext({});

export const useMDXScope = scope => {
  const contextScope = useContext(GatsbyMDXScopeContext);
  return scope || contextScope;
};

export const MDXScopeProvider = ({ __mdxScope, children }) => {
  return React.createElement(
    GatsbyMDXScopeContext.Provider,
    { value: __mdxScope },
    children
  );
};

export const MDXRenderer = ({ scope, components, children, ...props }) => {
  const mdxComponents = useMDXComponents(components);
  const mdxScope = useMDXScope(scope);

  // Memoize the compiled component
  const End = React.useMemo(() => {
    if (!children) {
      return null;
    }

    const fullScope = {
      // React is here just in case the user doesn't pass them in
      // in a manual usage of the renderer
      React,
      mdx,
      ...mdxScope
    };

    const keys = Object.keys(fullScope);
    const values = keys.map(key => fullScope[key]);
    const fn = new Function(`_fn`, ...keys, `${children}`);

    return fn({}, ...values);
  }, [children, scope]);

  return React.createElement(End, { components: mdxComponents, ...props });
};
