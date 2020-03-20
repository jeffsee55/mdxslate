import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState
} from "react";
import ReactDOM from "react-dom";
import { Editor, Transforms, Range, createEditor } from "slate";
import { Slate, Editable, ReactEditor, withReact } from "slate-react";
import unified from "unified";
import remark from "remark";
import mdx from "remark-mdx";
import remarkSlate, { fromSlate } from "./remark-slate";
import mdxStringify from "./mdx-stringify";
import stringify from "remark-stringify";
import styled from "styled-components";
import * as S from "./styles";

const FallbackElement = styled.div``;

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const SlatePoc = ({
  schemaMap,
  renderJsx,
  components,
  onExitEditMode,
  initialValue
}) => {
  const ref = useRef();
  const [value, setValue] = useState([]);
  const [target, setTarget] = useState();
  const [isSelectingComponent, setIsSelectingComponent] = useState(false);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");
  const renderElement = useCallback(props => {
    if (props.element.type === "jsx") {
      return (
        <S.JsxWrapper>
          <S.JsxInnerWrapper>
            <S.TinaHover onClick={() => alert("activate form")} />
            {renderJsx(props.element.children[0].text)}
          </S.JsxInnerWrapper>
        </S.JsxWrapper>
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
        // style={{
        //   fontWeight: leaf.bold ? "bold" : "normal",
        //   fontStyle: leaf.italic ? "italic" : "normal"
        // }}
      >
        {children}
      </span>
    );
  }, []);
  const editor = useMemo(() => withReact(createEditor()), []);

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

  const matchedComponents = schemaMap.filter(c =>
    c.id.toLowerCase().startsWith(search.toLowerCase())
  );

  useEffect(() => {
    if (target && matchedComponents.length > 0) {
      if (ref.current) {
        const el = ref.current;
        const domRange = ReactEditor.toDOMRange(editor, target);
        const rect = domRange.getBoundingClientRect();
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
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
            .use(stringify)
            .use(mdxStringify)
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
            <S.ComponentPicker
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

export default SlatePoc;
