/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "test.mywishlists.ru"],
        }
    }
};


module.exports = nextConfig
