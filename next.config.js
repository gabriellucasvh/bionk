// next.config.js
module.exports = {
	allowedDevOrigins: [
		process.env.ALLOWED_DEV_ORIGIN || "http://localhost:3000",
	],
	compress: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "www.google.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "http2.mlstatic.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.pexels.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "image-cdn-ak.spotifycdn.com",
				pathname: "/**",
			},
		],
		qualities: [25, 50, 75, 90, 95, 100],
	},
};
