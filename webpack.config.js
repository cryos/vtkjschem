var path = require('path'),
    webpack = require('webpack'),
    loaders = require('./node_modules/vtk.js/Utilities/config/webpack.loaders.js'),
    plugins = [];
if(process.env.NODE_ENV === 'production') {
    console.log('==> Production build');
    plugins.push(new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify("production"),
        },
    }));
}
module.exports = {
  plugins: plugins,
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'MyWebApp.js',
  },
  module: {
    loaders: [
        { test: require.resolve("./src/index.js"), loader: "expose?MyWebApp" },
    ].concat(loaders),
  },
  postcss: [
    require('autoprefixer')({ browsers: ['last 2 versions'] }),
  ],
  resolve: {
    alias: {
      'vtk.js': path.resolve('./node_modules/vtk.js'),
    },
  },
};
