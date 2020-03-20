import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState
} from "react";
import { Formik, Form, Field } from "formik";
import styled from "styled-components";

export const StyledComponentPicker = styled.div`
  top: -9999px;
  left: -9999px;
  position: absolute;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
  width: 250px;
  padding: 20px;
  padding: "3px 3px 2px";
  margin: 0 1px;
  vertical-align: baseline;
  display: inline-block;
  border-radius: 4px;
  background-color: #eee;
  height: 200px;
`;
export const Header = styled.div`
  padding: 1em 1em 0.3em;
`;
export const ComponentOption = styled.div`
  padding: 0.3em 1em;
`;
export const PropsContainer = styled.div`
  padding: 0.3em 1em;
`;

export const ComponentPicker = React.forwardRef(
  ({ onChoose, children, options, ...rest }, ref) => {
    const [option, setOption] = React.useState(null);

    const onPropsSubmitted = values => onChoose({ id: option, props: values });

    return (
      <StyledComponentPicker {...rest} ref={ref}>
        <Header>{option ? "Provide your props" : "Choose a component"}</Header>
        {option ? (
          <PropPicker
            {...options.find(({ id }) => id === option)}
            onPropsSubmitted={onPropsSubmitted}
          />
        ) : (
          options.map(option => {
            return (
              <ComponentOption onClick={() => setOption(option.id)}>
                {option.id}
              </ComponentOption>
            );
          })
        )}
      </StyledComponentPicker>
    );
  }
);

export const PropPicker = ({ id, props, onPropsSubmitted }) => {
  return (
    <PropsContainer>
      <Formik
        validationSchema={props.validationSchema}
        initialValues={props.initialValues}
        onSubmit={values => {
          onPropsSubmitted(values);
        }}
      >
        {({ errors, touched }) => (
          <Form>
            {props.fields.map(field => (
              <>
                <label>
                  {field.name}
                  <Field name={field.name} />
                </label>
                <div>{touched[field.name] && errors[field.name]}</div>
              </>
            ))}
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </PropsContainer>
  );
};
