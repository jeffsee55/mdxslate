import React from "react";
import MDX from "@mdx-js/runtime";
import Editor from "../components/editor";
import { ThemeProvider } from "styled-components";
import * as S from "./components";
import * as Yup from "yup";

const components = {
  "heading-1": S.H1,
  h1: S.H1,
  paragraph: S.P,
  p: S.P,
  code: S.Pre,
  inlineCode: S.Code,
  Img: S.Img,
  ContactUs: S.ContactUs
};

const dummyText = `# Hello World

Here is some text, it's a paragraph with styling provided by a theme

<ContactUs submitText="Hello" />
`;
export default props => {
  const [inEditMode, setInEditMode] = React.useState(true);
  const [value, setValue] = React.useState(dummyText);
  return (
    <ThemeProvider theme={{ brandColor: "tomato" }}>
      <S.GlobalStyle />
      <S.SplitView
        leftSide={
          inEditMode ? (
            <Editor
              schemaMap={schemaMap}
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
              <button onClick={() => setInEditMode(true)}>
                Turn on edit mode
              </button>
              <MDX components={components}>{value}</MDX>
            </>
          )
        }
        rightSide={
          <>
            <h1>Markdown string:</h1>
            <pre style={{ fontFamily: "monospace", fontSize: "18px" }}>
              {value}
            </pre>
          </>
        }
      />
    </ThemeProvider>
  );
};

const schemaMap = [
  {
    id: "ContactUs",
    inline: true,
    props: {
      validationSchema: Yup.object().shape({
        submitUrl: Yup.string()
          .url("Must be a url")
          .required("Required"),
        submitText: Yup.string()
      }),
      fields: [
        { name: "submitUrl", type: "text" },
        { name: "submitText", type: "text" }
      ],
      initialValues: {
        submitUrl: "",
        submitText: ""
      }
    }
  },
  {
    id: "Img",
    inline: true,
    props: {
      validationSchema: Yup.object({
        src: Yup.string()
          .url("Must be a url")
          .required("Required")
      }),
      fields: [{ name: "src", type: "text" }],
      initialValues: {
        src: ""
      }
    }
  }
];
