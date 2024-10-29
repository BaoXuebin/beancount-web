const CracoLessPlugin = require('craco-less');

module.exports = {
  babel: {
    plugins: [
      "@babel/plugin-proposal-optional-chaining",
    ],
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add a rule to handle .mjs files
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};