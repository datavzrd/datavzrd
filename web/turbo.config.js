const path = require('path');
const { defineConfig } = require('@turbo/pack');

module.exports = defineConfig({
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
});
