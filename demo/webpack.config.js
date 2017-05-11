const postcssSrcset = require("../index.js");

module.exports = {
  entry: require.resolve("./src/app.js"),
  output: {
    filename: "app.bundle.js",
    path: __dirname + "/build",
    publicPath: "build/"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [postcssSrcset()]
            }
          }
        ]
      },
      {
        test: /\.jpe?g/,
        rules: [
          {
            loader: "file-loader?name=[name]-[hash:5].[ext]"
          },
          {
            resourceQuery: /[?&]size=\d+(&|$)/,
            loader: postcssSrcset.loader
          }
        ]
      }
    ]
  }
};
