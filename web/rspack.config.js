const path = require('path');
const rspack = require('@rspack/core');

module.exports = {
    entry: './src/datavzrd.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        library: 'datavzrd',
        libraryTarget: 'umd',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'window',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new rspack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
        }),
    ],
    experiments: {
        css: false
    }
};
