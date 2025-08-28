// src/config/blacklist.ts

// Nomes de usuário proibidos por questões de segurança ou reserva
const FORBIDDEN_USERNAMES: string[] = [
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
];

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
];

// Combina as duas listas e remove duplicados
export const BLACKLISTED_USERNAMES: string[] = [
	...new Set([...FORBIDDEN_USERNAMES, ...APP_ROUTES]),
];
