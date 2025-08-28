// src/config/blacklist.ts

// Nomes de usuário proibidos por questões de segurança ou reserva
const BASE_FORBIDDEN_USERNAMES: string[] = [
	"admin",
	"suporte",
	"contato",
	"root",
	"administrador",
	"login",
	"registro",
	"perfil",
	"studio",
	"settings",
	"api",
	"v1",
	"v2",
	"bionk",
	"bionkme",
	"bionk_me",
	"facebook",
	"instagram",
	"twitter",
	"tiktok",
	"youtube",
	"linkedin",
	"snapchat",
	"pinterest",
	"reddit",
	"whatsapp",
	"telegram",
	"discord",
	"medium",
	"tumblr",
	"twitch",
	"flickr",
	"vimeo",
	"mastodon",
	"wechat",
	"line",
];

// Função para adicionar a variante com _
const withUnderscore = (list: string[]) =>
	list.flatMap((name) => [name, `${name}_`]);

// Rotas da aplicação que não podem ser nomes de usuário
const APP_ROUTES: string[] = [
	"ajuda",
	"analises",
	"artigo",
	"checkout",
	"configs",
	"descubra",
	"guia",
	"links",
	"login",
	"personalizar",
	"planos",
	"privacidade",
	"registro",
	"reset-password",
	"studio",
	"templates",
	"termos",
	"verify-email",
	"carreira",
	"talentos",
	"precos",
	"assinar",
	"assinaturas",
	"comprar",
	"oficial",
	"official",
	"official",
	"site",
	"cobranca",
];

// Combina as duas listas, adiciona variantes com _ e remove duplicados
export const BLACKLISTED_USERNAMES: string[] = [
	...new Set([
		...withUnderscore(BASE_FORBIDDEN_USERNAMES),
		...withUnderscore(APP_ROUTES),
	]),
];
