const path = require('path');

module.exports = {
    entry: './src/datavzrd.js',
    mode: 'production',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};