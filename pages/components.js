import styled, { createGlobalStyle } from "styled-components";

export const H1 = styled.h1`
  font-size: 48px;
  line-height: 1.3;
`;
export const H2 = styled.h2``;
export const H3 = styled.h3``;
export const H4 = styled.h4``;
export const H5 = styled.h5``;
export const P = styled.p`
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1.2;
  margin-bottom: 1rem;
`;
export const Code = styled.code``;
export const Pre = styled.pre``;

export const Img = styled.img`
  max-width: 300px;
  border: 10px solid white;
  border-radius: 3px;
`;
const ContactWrapper = styled.div`
  margin: 1rem 0;
  padding: 1rem;
`;

export const ContactUs = props => {
  return (
    <ContactWrapper>
      <label>
        Get in Touch
        <input type="text" />
      </label>
      <button>{props.submitText}</button>
    </ContactWrapper>
  );
};

export const GlobalStyle = createGlobalStyle`
/* http://meyerweb.com/eric/tools/css/reset/
   v2.0 | 20110126
   License: none (public domain)
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
  font-family: sans-serif;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
	display: block;
}
html, body {
  font-family: sans-serif;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
`;
