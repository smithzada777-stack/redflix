/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['firebase-admin'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'imgur.com',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
            },
        ],
    },
};

module.exports = nextConfig;
