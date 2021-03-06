const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/
});
module.exports = withMDX({
  pageExtensions: ["js", "jsx", "md", "mdx"],
  webpack: (config, options) => {
    config.node = {
      fs: "empty"
    };
    return config;
  }
});
