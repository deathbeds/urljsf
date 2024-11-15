// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import webpack from 'webpack';

import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const COV = process.env.COV;
const WATCH = process.argv.includes('--watch');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class JSONLicenseWebpackPlugin extends LicenseWebpackPlugin {
  constructor(pluginOptions = {}) {
    super({
      outputFilename: 'third-party-licenses.json',
      ...pluginOptions,
      renderLicenses: (modules) => this.renderLicensesJSON(modules),
      perChunkOutput: false,
    });
  }

  /** render an SPDX-like record */
  renderLicensesJSON(modules) {
    const packages /** @type {Record<string,any>} */ = [];
    const report = { packages };

    modules.sort((left, right) => (left.name < right.name ? -1 : 1));

    for (const mod of modules) {
      report.packages.push({
        name: mod.name || '',
        versionInfo: mod.packageJson.version || '',
        licenseId: mod.licenseId || '',
        extractedText: mod.licenseText || '',
      });
    }

    return JSON.stringify(report, null, 2);
  }
}

/** @type {import('webpack').Configuration} */
const config = {
  mode: COV || WATCH ? 'development' : 'production',
  devtool: 'source-map',
  entry: './lib/index.js',
  experiments: { outputModule: true },
  output: {
    path: path.resolve(__dirname, COV ? '../build/dist-cov/urljsf' : './dist/urljsf'),
    filename: 'index.js',
    chunkFilename: ({ chunk }) => {
      return `${chunk.id}.${chunk.hash?.slice(0, 8)}.js`;
    },
    library: { type: 'module' },
    clean: true,
    asyncChunks: true,
  },
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '../build/.cache/webpack'),
  },
  module: {
    rules: [
      COV
        ? {
            test: /\.js$/,
            use: {
              loader: '@ephesoft/webpack.istanbul.loader',
              options: { esModules: true },
            },
            enforce: 'post',
          }
        : { test: /\.js$/, loader: 'source-map-loader', enforce: 'pre' },
      {
        test: /bootstrap\/dist\/css\/bootstrap\.min\.css/,
        type: 'asset',
        generator: { filename: '[name][ext]?v=[hash:8]' },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'demo/*/*.{json,toml,yaml}' }, { from: 'schema/*/*.json' }],
    }),
    new HtmlWebpackPlugin({
      filename: 'demo/index.html',
      template: 'demo/index.html',
      scriptLoading: 'module',
      minify: false,
      templateParameters: {
        formats: ['toml', 'yaml', 'json'],
      },
    }),
    new webpack.ids.HashedModuleIdsPlugin(),
    new JSONLicenseWebpackPlugin(),
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat', // Must be below test-utils
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minChunks: 3,
    },
    minimize: !WATCH,
    minimizer: [new TerserPlugin({ extractComments: 'all' })],
  },
};

export default config;
