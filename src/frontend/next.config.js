/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '3mb',
        }
    }
};


const { withSentryConfig } = require("@sentry/nextjs");

// В формате sentryUrl;org;project
SENTRY_CONF = process.env.SENTRY_CONF.split(";")



module.exports = withSentryConfig(
    nextConfig,
    {
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: {
      enabled: true,
    },
    sentryUrl: SENTRY_CONF[0],
    hideSourceMaps: true,
    disableLogger: true,
    org: SENTRY_CONF[1],
    project: SENTRY_CONF[2],
    authToken: process.env.SENTRY_AUTH_TOKEN,
    release: process.env.NEXT_PUBLIC_VERSION,
  }
);
