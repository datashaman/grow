path = require('path')

module.exports = {
  entry: {
    settings: "./scripts/settings.js",
    home: "./scripts/home.js"
  },
  output: {
    path: path.join(__dirname, "scripts"),
    filename: "[name].entry.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.json/, loader: "json" }
    ]
  }
};
