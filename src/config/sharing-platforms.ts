// src/config/sharing-platforms.ts

export const SHARING_PLATFORMS = [
	{
		key: "whatsapp",
		name: "WhatsApp",
		icon: "/icons/whatsapp.svg",
		color: "bg-green-500 hover:bg-green-600",
		urlTemplate: "https://wa.me/?text={title}%20{url}",
	},
	{
		key: "twitter",
		name: "X (Twitter)",
		icon: "/icons/x.svg",
		color: "bg-black hover:bg-gray-800",
		urlTemplate: "https://twitter.com/intent/tweet?text={title}&url={url}",
	},
	{
		key: "facebook",
		name: "Facebook",
		icon: "/icons/facebook.svg",
		color: "bg-blue-600 hover:bg-blue-700",
		urlTemplate: "https://www.facebook.com/sharer/sharer.php?u={url}",
	},
	{
		key: "telegram",
		name: "Telegram",
		icon: "/icons/telegram.svg",
		color: "bg-sky-500 hover:bg-sky-600",
		urlTemplate: "https://t.me/share/url?url={url}&text={title}",
	},
	{
		key: "linkedin",
		name: "LinkedIn",
		icon: "/icons/linkedin.svg",
		color: "bg-blue-700 hover:bg-blue-800",
		urlTemplate: "https://www.linkedin.com/sharing/share-offsite/?url={url}",
	},
	{
		key: "reddit",
		name: "Reddit",
		icon: "/icons/reddit.svg",
		color: "bg-orange-500 hover:bg-orange-600",
		urlTemplate: "https://www.reddit.com/submit?url={url}&title={title}",
	},
	{
		key: "pinterest",
		name: "Pinterest",
		icon: "/icons/pinterest.svg",
		color: "bg-red-600 hover:bg-red-700",
		urlTemplate:
			"https://www.pinterest.com/pin/create/button/?url={url}&description={title}",
	},
	{
		key: "email",
		name: "Email",
		icon: "/icons/mail.svg",
		color: "bg-gray-500 hover:bg-gray-600",
		urlTemplate: "mailto:?subject={title}&body={url}",
	},
];
