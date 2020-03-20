import phrasing from "mdast-util-phrasing";

export const fromSlate = node => {
  if (node.type === "root") {
    return {
      type: "root",
      children: node.children.map(fromSlate)
    };
  }
  if (node.type === "heading-1") {
    return {
      type: "heading",
      depth: 1,
      children: node.children.map(fromSlate)
    };
  }
  if (node.type === "paragraph") {
    return {
      type: "paragraph",
      children: node.children.map(fromSlate)
    };
  }
  if (node.type === "jsx") {
    return {
      type: "jsx",
      value: node.children[0].text
    };
  }
  return {
    type: "text",
    value: node.text
  };
};

const toSlate = node => {
  if (node.type === "heading") {
    return {
      object: "block",
      type: "heading-" + node.depth,
      children: node.children.map(toSlate)
    };
  }
  if (node.type === "text") {
    return {
      object: "text",
      text: node.value
    };
  }
  if (phrasing(node)) {
    const parentMark = {
      object: "mark",
      type: node.type
    };
    const nodes = node.children.map(child => {
      const childMark = child.type !== "text" && {
        object: "mark",
        type: child.type
      };
      return {
        object: "text",
        text: child.value,
        marks: [parentMark, childMark].filter(Boolean)
      };
    });
    return nodes;
  }
  if (node.type === "jsx") {
    return {
      object: "block",
      type: "jsx",
      children: [toSlate({ type: "text", value: node.value })]
    };
  }
  return {
    object: "block",
    type: node.type,
    children: node.children.map(toSlate)
  };
};
export default function remarkSlate() {
  this.Compiler = compiler;
  function compiler(node) {
    if (node.type === "root") {
      return {
        object: "value",
        document: {
          object: "document",
          data: {},
          children: node.children.map(toSlate)
        }
      };
    }
  }
}
