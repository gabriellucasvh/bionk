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
			{
				protocol: "https",
				hostname: "cdn-images.dzcdn.net",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "is1-ssl.mzstatic.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "i1.sndcdn.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "f4.bcbits.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "i.audiomack.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.audiomack.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "image-cdn.audiomack.com",
				pathname: "/**",
			},
		],
		qualities: [25, 50, 75, 90, 95, 100],
	},
};
