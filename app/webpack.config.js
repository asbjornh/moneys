const path = require("path");
const webpack = require("webpack");

const AppCachePlugin = require("appcache-webpack-plugin");
const autoprefixer = require("autoprefixer");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const cssnano = require("cssnano");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env = {}) => {
  const isProduction = env.production === true;

  return {
    entry: {
      app: ["formdata-polyfill", "./source/app.js"]
    },
    output: {
      path: path.resolve(__dirname + "/build"),
      filename: isProduction ? "[name].[hash].js" : "[name].js"
    },
    devServer: {
      stats: "minimal"
    },
    node: {
      fs: "empty"
    },
    stats: !isProduction ? {} : "minimal",
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [{ loader: CssExtractPlugin.loader }, "css-loader"]
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [
            { loader: CssExtractPlugin.loader },
            {
              loader: "css-loader",
              options: { importLoaders: 1 }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: [autoprefixer].concat(isProduction ? cssnano : [])
              }
            },
            { loader: "resolve-url-loader" },
            { loader: "sass-loader", options: { sourceMap: true } }
          ]
        },
        {
          test: /\.module\.scss$/,
          use: [
            { loader: CssExtractPlugin.loader },
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: "[local]__[hash:base64:5]"
              }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: [autoprefixer].concat(isProduction ? cssnano : [])
              }
            },
            { loader: "sass-loader" }
          ]
        },
        {
          test: /\.png$/,
          use: "url-loader"
        },
        {
          test: /\.(svg|jpg|woff2?|ttf|eot)$/,
          use: "file-loader"
        },
        {
          test: require.resolve("react"),
          loader: "expose-loader?React"
        },
        {
          test: require.resolve("react-dom"),
          loader: "expose-loader?ReactDOM"
        },
        {
          test: require.resolve("react-dom/server"),
          loader: "expose-loader?ReactDOMServer"
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ["babel-loader", "eslint-loader"]
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx", ".scss"]
    },
    plugins: (() => {
      const plugins = [
        new CssExtractPlugin({
          filename: isProduction ? "app.[hash].css" : "app.css"
        }),
        new HtmlWebpackPlugin({
          template: isProduction ? "source/index.html" : "source/index.dev.html"
        }),
        new AppCachePlugin({
          output: "cache.manifest",
          exclude: [/\.htaccess$/, /\.php$/]
        })
      ];

      if (isProduction) {
        return plugins.concat([
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify("production")
            }
          }),
          new CopyWebpackPlugin([
            { from: "source/assets/apple-touch-icon.png", to: "" },
            { from: "../.htaccess", to: "" },
            { from: "robots.txt", to: "" }
          ])
        ]);
      }

      return plugins;
    })()
  };
};
