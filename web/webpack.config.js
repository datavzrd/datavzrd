const path = require('path');
const webpack = require('webpack')

module.exports = {
    entry: './src/datavzrd.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        library: 'datavzrd',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
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
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
        }),
    ],
};