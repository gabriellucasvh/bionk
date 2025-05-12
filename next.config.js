// next.config.js
module.exports = {
  allowedDevOrigins: [process.env.ALLOWED_DEV_ORIGIN || 'http://localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};
