module.exports = function (api) {
    api.cache.forever();

    const presets = [
        '@babel/preset-typescript',
        [
            '@babel/preset-env',
            {
                targets: {node: 'current'},
            },
        ],
    ];

    const plugins = [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
    ];

    return {
        presets,
        plugins,
        sourceMaps: 'inline',
    }
};
