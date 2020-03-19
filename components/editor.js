import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState
} from "react";
import ReactDOM from "react-dom";
import { Editor, Transforms, Range, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, Editable, ReactEditor, withReact } from "slate-react";
import unified from "unified";
import parse from "remark-parse";
import remark from "remark";
import mdx from "remark-mdx";
import remarkSlate, { fromSlate } from "./remark-slate";
import stringifyJsx from "./stringify-jsx";
import stringify from "remark-stringify";
import styled from "styled-components";

const FallbackElement = styled.div``;

// This could probably be a portal
// that just positions itself based on
// the ref - that's the best way to
// guarantee we don't mess up the document
// flow
const JsxWrapper = styled.div`
  display: block;
`;
const JsxInnerWrapper = styled.div`
  display: inline-block;
  position: relative;
`;
const TinaHover = styled.span`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid royalblue;
  z-index: 10;
`;

import * as Yup from "yup";
import * as U from "./util";

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const SlatePoc = ({ renderJsx, components, onExitEditMode, initialValue }) => {
  const ref = useRef();
  const [value, setValue] = useState([]);
  const [target, setTarget] = useState();
  const [isSelectingComponent, setIsSelectingComponent] = useState(false);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");
  const renderElement = useCallback(props => {
    if (props.element.type === "jsx") {
      return (
        <JsxWrapper>
          <JsxInnerWrapper>
            <TinaHover />
            {renderJsx(props.element.children[0].text)}
          </JsxInnerWrapper>
        </JsxWrapper>
      );
    } else {
      const UserProvidedComponent = components[props.element.type];
      if (UserProvidedComponent) {
        return <UserProvidedComponent {...props} />;
      } else {
        return <FallbackElement as={props.element.type} {...props} />;
      }
    }
  }, []);
  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    return (
      <span
        {...attributes}
        style={{
          fontWeight: leaf.bold ? "bold" : "normal",
          fontStyle: leaf.italic ? "italic" : "normal"
        }}
      >
        {children}
      </span>
    );
  }, []);
  const editor = useMemo(
    () => withJSX(withReact(withHistory(createEditor()))),
    []
  );

  useEffect(() => {
    const doit = async () => {
      const val = await remark()
        .use(mdx)
        .use(remarkSlate)
        .use(() => tree => {
          // console.log(tree);
        })
        .process(initialValue);
      setValue(val.contents.document.children);
    };
    doit();
  }, [initialValue]);

  const matchedComponents = COMPONENTS.filter(c =>
    c.id.toLowerCase().startsWith(search.toLowerCase())
  );

  useEffect(() => {
    if (target && matchedComponents.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [matchedComponents.length, editor, index, search, target]);

  useEffect(() => {
    if (matchedComponents.length > 0) {
      setIsSelectingComponent(true);
    } else {
      setIsSelectingComponent(false);
    }
  }, [matchedComponents.length]);

  return (
    <>
      <button
        onClick={() => {
          const mdAst = fromSlate({ type: "root", children: value });
          const markdownString = unified()
            .use(stringifyJsx)
            .use(stringify)
            .stringify(mdAst);
          onExitEditMode(markdownString);
        }}
      >
        Exit
      </button>
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          setValue(value);
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: "word" });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.string(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange);
              setSearch(beforeMatch[1]);
              setIndex(0);
              return;
            }
          }

          if (isSelectingComponent) {
            return;
          }

          setTarget(null);
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some text..."
        />
        {isSelectingComponent && matchedComponents.length > 0 && (
          <Portal>
            <U.ComponentPicker
              ref={ref}
              options={matchedComponents}
              onChoose={({ id, props }) => {
                Transforms.select(editor, target);
                insertComponent(editor, id, props);
                setIsSelectingComponent(false);
                setTarget(null);
              }}
            />
          </Portal>
        )}
      </Slate>
    </>
  );
};

const withJSX = editor => {
  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === "jsx" ? true : isVoid(element);
  };

  return editor;
};

import prettyFormat from "pretty-format";
const { ReactElement } = prettyFormat.plugins;
const insertComponent = (editor, id, { children, ...props }) => {
  // We're only creating this element so we can stringify it and save it to the file
  const element = React.createElement(id, props, children);
  const prettyJsxString = prettyFormat(element, {
    plugins: [ReactElement],
    printFunctionName: false
  });

  const component = {
    object: "block",
    type: "jsx",
    children: [{ object: "text", text: prettyJsxString }]
  };
  Transforms.insertNodes(editor, component);
  Transforms.move(editor);
};

const COMPONENTS = [
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

export default SlatePoc;
