const urlRegex = /^(https?:\/\/)?([^\s.]+\.[^\s]{2,})$/;

export const isValidUrl = (url: string) => urlRegex.test(url);

export const fetcher = (url: string) => fetch(url).then((res) => res.json());
