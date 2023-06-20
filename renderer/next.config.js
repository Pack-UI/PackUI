module.exports = {
    webpack: (config, {isServer}) => {
        if (!isServer) {
            config.target = 'electron-renderer';
        }

        return config;
    },
    images: {
        domains: ['localhost', 'cdn.packui.net', 'media.tenor.com', 'i.imgur.com'],
    }
};
