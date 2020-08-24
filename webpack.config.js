const path = require('path');
module.exports = {
    mode: "development",
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'color_picker.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    }
};
