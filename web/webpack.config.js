const path = require('path');

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
};