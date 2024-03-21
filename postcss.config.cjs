module.exports = {
    plugins: [
        require('postcss-nested'),
        require('postcss-preset-env', {
            features: { 'nesting-rules': false },
        }),
        require('autoprefixer'),
    ],
};