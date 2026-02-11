/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['firebase-admin'],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
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
