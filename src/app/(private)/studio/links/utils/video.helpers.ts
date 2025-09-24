export interface VideoPlatform {
	name: string;
	iconPath: string;
	bgColor: string;
}

export const getVideoPlatform = (url: string): VideoPlatform => {
	const urlLower = url.toLowerCase();

	if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
		return {
			name: 'YouTube',
			iconPath: '/icons/youtube.svg',
			bgColor: 'bg-red-600'
		};
	}

	if (urlLower.includes('vimeo.com')) {
		return {
			name: 'Vimeo',
			iconPath: '/icons/vimeo.svg',
			bgColor: 'bg-blue-500'
		};
	}

	if (urlLower.includes('twitch.tv')) {
		return {
			name: 'Twitch',
			iconPath: '/icons/twitch.svg',
			bgColor: 'bg-purple-600'
		};
	}

	if (urlLower.includes('tiktok.com')) {
		return {
			name: 'TikTok',
			iconPath: '/icons/tiktok.svg',
			bgColor: 'bg-black'
		};
	}

	if (urlLower.includes('kick.com')) {
		return {
			name: 'Kick',
			iconPath: '/icons/kick.svg',
			bgColor: 'bg-green-500'
		};
	}

	return {
		name: 'Vídeo',
		iconPath: '',
		bgColor: 'bg-gray-500'
	};
};