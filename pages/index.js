// src/App.js
import React from "react";
import MDX from "@mdx-js/runtime";
import Editor from "../components/editor";
import styled from "styled-components";

const Element = props => {
  console.log(props);
  return <h1 {...props} />;
};

const Img = styled.img`
  max-width: 300px;
  border: 10px solid white;
  border-radius: 3px;
`;

const ContactUs = props => {
  return (
    <div>
      Get in Touch
      <input type="text" />
      <button>{props.submitText}</button>
    </div>
  );
};

const components = {
  "heading-1": Element,
  h2: Element,
  p: Element,
  code: Element,
  inlineCode: Element,
  Img: Img,
  ContactUs,
  Yo: props => <h1 {...props} />
};

const dummyText = `
# Hello World


This is a test


<ContactUs submitText="Hello" />
`;
export default props => {
  const [inEditMode, setInEditMode] = React.useState(true);
  const [value, setValue] = React.useState(dummyText);
  return (
    <div>
      {inEditMode ? (
        <Editor
          onExitEditMode={value => {
            setInEditMode(false);
            setValue(value);
          }}
          renderJsx={jsxString => (
            <MDX components={components}>{jsxString}</MDX>
          )}
          components={components}
          initialValue={value}
        />
      ) : (
        <>
          <button onClick={() => setInEditMode(true)}>Turn on edit mode</button>
          <MDX components={components}>{value}</MDX>
        </>
      )}
    </div>
  );
};
