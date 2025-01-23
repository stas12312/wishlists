/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "test.mywishlists.ru"],
            bodySizeLimit: '3mb',
        }
    }
};


module.exports = nextConfig
