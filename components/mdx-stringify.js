function mdxStringify() {
  const parser = this.Parser;
  const compiler = this.Compiler;
  function attachParser(parser) {
    const blocks = parser.prototype.blockTokenizers;
    // const inlines = parser.prototype.inlineTokenizers;
    const methods = parser.prototype.blockMethods;

    blocks.esSyntax = tokenizeEsSyntax;
    blocks.html = wrap(block);
    // inlines.html = wrap(inlines.html, inlineJsx);

    methods.splice(methods.indexOf("paragraph"), 0, "esSyntax");
  }

  function attachCompiler(compiler) {
    const proto = compiler.prototype;

    proto.visitors = Object.assign({}, proto.visitors, {
      import: stringifyEsSyntax,
      export: stringifyEsSyntax,
      jsx: stringifyEsSyntax
    });
  }

  function stringifyEsSyntax(node) {
    return node.value.trim();
  }

  if (parser && parser.prototype && parser.prototype.blockTokenizers) {
    attachParser(parser);
  }

  if (compiler && compiler.prototype && compiler.prototype.visitors) {
    attachCompiler(compiler);
  }
}

module.exports = mdxStringify;
