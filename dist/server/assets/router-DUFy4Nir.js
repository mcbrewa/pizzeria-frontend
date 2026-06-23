import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "../server.js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRoute, createRouter, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import axios from "axios";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { ChevronDown, Heart, Menu, ShoppingBasket, User, X } from "lucide-react";
import clsx from "clsx";
//#region src/api/client.ts
var accessToken = null;
var setAccessToken = (token) => {
	accessToken = token;
};
var authClient = axios.create({
	baseURL: "/api-auth",
	withCredentials: true
});
var pizzeriaClient = axios.create({
	baseURL: "/api",
	withCredentials: true
});
var attachToken = (client) => {
	client.interceptors.request.use((config) => {
		if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
		return config;
	});
};
attachToken(authClient);
attachToken(pizzeriaClient);
var isRefreshing = false;
var refreshQueue = [];
var processQueue = (token) => {
	refreshQueue.forEach((cb) => cb(token));
	refreshQueue = [];
};
var doTokenRefresh = async () => {
	const res = await fetch("/api-auth/auth/refresh", {
		method: "POST",
		credentials: "include"
	});
	if (!res.ok) throw new Error("Refresh failed");
	const token = (await res.json()).data?.accessToken;
	if (!token) throw new Error("No token in refresh response");
	setAccessToken(token);
	return token;
};
var setupAuthInterceptor = (client) => {
	client.interceptors.response.use((response) => response, async (error) => {
		const originalRequest = error.config;
		const is401 = error.response?.status === 401;
		const isRefreshUrl = originalRequest.url?.includes("/auth/refresh");
		if (!is401 || isRefreshUrl || originalRequest._retry) return Promise.reject(error);
		if (isRefreshing) return new Promise((resolve, reject) => {
			refreshQueue.push((token) => {
				if (!token) {
					reject(error);
					return;
				}
				originalRequest.headers.Authorization = `Bearer ${token}`;
				originalRequest._retry = true;
				resolve(client(originalRequest));
			});
		});
		originalRequest._retry = true;
		isRefreshing = true;
		try {
			const token = await doTokenRefresh();
			processQueue(token);
			originalRequest.headers.Authorization = `Bearer ${token}`;
			return client(originalRequest);
		} catch {
			processQueue(null);
			setAccessToken(null);
			window.dispatchEvent(new Event("auth:forced-logout"));
			return Promise.reject(error);
		} finally {
			isRefreshing = false;
		}
	});
};
setupAuthInterceptor(authClient);
setupAuthInterceptor(pizzeriaClient);
//#endregion
//#region src/contexts/AuthContext.tsx
var AuthContext = createContext(null);
var useAuthContext = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
	return ctx;
};
var PIZZERIA_ORG_ID = "6a3577db82b51cf755d1630b";
var extractProfile = (data) => {
	const d = data;
	const raw = d?.data ?? d;
	return {
		id: raw.id ?? "",
		firstName: raw.firstName ?? "",
		email: raw.email ?? "",
		organisationId: raw.organisationId ?? "",
		roles: raw.roles ?? []
	};
};
var assertPizzeriaOrg = (organisationId) => {
	if (!Boolean(PIZZERIA_ORG_ID)) return;
	if (organisationId !== PIZZERIA_ORG_ID) throw new Error("To konto nie należy do organizacji Pizzeria.");
};
var AuthProvider = ({ children, initialAuthState }) => {
	const [user, setUser] = useState(() => {
		if (!initialAuthState) return null;
		setAccessToken(initialAuthState.accessToken);
		return initialAuthState.user;
	});
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		const handleForcedLogout = () => {
			setAccessToken(null);
			setUser(null);
		};
		window.addEventListener("auth:forced-logout", handleForcedLogout);
		return () => window.removeEventListener("auth:forced-logout", handleForcedLogout);
	}, []);
	const login = useCallback(async (email, password) => {
		setIsLoading(true);
		try {
			const res = await authClient.post("/auth/login", {
				email,
				password
			});
			setAccessToken(res.data?.data?.accessToken ?? res.data?.accessToken);
			const profile = extractProfile((await authClient.get("/users/profile")).data);
			assertPizzeriaOrg(profile.organisationId);
			setUser(profile);
		} finally {
			setIsLoading(false);
		}
	}, []);
	const logout = useCallback(async () => {
		setIsLoading(true);
		try {
			await authClient.post("/auth/logout").catch(() => {});
		} finally {
			setAccessToken(null);
			setUser(null);
			setIsLoading(false);
		}
	}, []);
	const { permissionSlugs, roleSlugs } = useMemo(() => {
		if (!user) return {
			permissionSlugs: /* @__PURE__ */ new Set(),
			roleSlugs: /* @__PURE__ */ new Set()
		};
		return {
			permissionSlugs: new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.slug))),
			roleSlugs: new Set(user.roles.map((r) => r.slug))
		};
	}, [user]);
	const hasPermission = useCallback((slug) => permissionSlugs.has(slug), [permissionSlugs]);
	const hasRole = useCallback((slug) => roleSlugs.has(slug), [roleSlugs]);
	const value = useMemo(() => ({
		user,
		isAuthenticated: !!user,
		isLoading,
		isInitialized: true,
		login,
		logout,
		hasPermission,
		hasRole
	}), [
		user,
		isLoading,
		login,
		logout,
		hasPermission,
		hasRole
	]);
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
};
//#endregion
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/api/server-auth.ts
var getServerAuthState = createServerFn({ method: "GET" }).handler(createSsrRpc("bb604f702874d060244a7c3f8ce176ebc9993affee63e2bab999e5e6637b32de"));
//#endregion
//#region src/styles.css?url
var styles_default = "/assets/styles-C9MhSjuv.css";
var common_default$2 = {
	nav: {
		"menuAndPromotions": "Menu i Promocje",
		"locations": "Lokale",
		"trackOrder": "Śledź zamówienie",
		"blog": "Blog",
		"work": "Praca",
		"contact": "Kontakt"
	},
	login: "ZALOGUJ SIĘ",
	logout: "WYLOGUJ SIĘ",
	actions: {
		"favorites": "Ulubione",
		"cart": "Koszyk"
	},
	gallery: {
		"prevButton": "Poprzednia promocja",
		"nextButton": "Następna promocja",
		"goToSlide": "Przejdź do slajdu {{n}}"
	},
	homePage: { "cta": {
		"orderOnline": "ZAMÓW ONLINE",
		"menuAndPromos": "MENU I PROMOCJE"
	} },
	auth: {
		"modal": {
			"title": "LOGOWANIE",
			"close": "Zamknij",
			"createAccount": "Załóż konto",
			"signIn": "Zaloguj się",
			"registrationComing": "Rejestracja — wkrótce"
		},
		"form": {
			"email": "Email",
			"password": "Hasło",
			"resetLink": "link do resetu hasła",
			"submit": "ZALOGUJ SIĘ",
			"submitting": "Logowanie...",
			"errorFallback": "Nieprawidłowy email lub hasło"
		}
	},
	notFoundPage: {
		"title": "Ta strona jest jeszcze w budowie",
		"subtitle": "Wróć wkrótce!"
	},
	orderPanel: {
		"back": "Wróć",
		"greeting": "Witaj {{name}}!",
		"orderOnline": "ZAMÓW ONLINE",
		"tabs": {
			"delivery": "Dostawa",
			"pickup": "Odbiór osobisty"
		},
		"fields": {
			"city": "Miasto",
			"street": "Ulica",
			"houseNumber": "Numer domu",
			"apartmentNumber": "Numer mieszkania"
		},
		"actions": {
			"next": "DALEJ",
			"findStore": "ZNAJDŹ LOKAL",
			"findOnMap": "WYBIERZ LOKAL NA MAPIE"
		},
		"pickup": { "subtitle": "Podaj adres, a znajdziemy najbliższy lokal:" }
	}
};
var common_default$1 = {
	nav: {
		"menuAndPromotions": "Menu & Promotions",
		"locations": "Locations",
		"trackOrder": "Track Order",
		"blog": "Blog",
		"work": "Jobs",
		"contact": "Contact"
	},
	login: "LOG IN",
	logout: "LOG OUT",
	actions: {
		"favorites": "Favorites",
		"cart": "Cart"
	},
	gallery: {
		"prevButton": "Previous promotion",
		"nextButton": "Next promotion",
		"goToSlide": "Go to slide {{n}}"
	},
	homePage: { "cta": {
		"orderOnline": "ORDER ONLINE",
		"menuAndPromos": "MENU & PROMOTIONS"
	} },
	auth: {
		"modal": {
			"title": "SIGN IN",
			"close": "Close",
			"createAccount": "Create account",
			"signIn": "Sign in",
			"registrationComing": "Registration — coming soon"
		},
		"form": {
			"email": "Email",
			"password": "Password",
			"resetLink": "password reset link",
			"submit": "SIGN IN",
			"submitting": "Signing in...",
			"errorFallback": "Invalid email or password"
		}
	},
	notFoundPage: {
		"title": "This page is still under construction",
		"subtitle": "Come back soon!"
	},
	orderPanel: {
		"back": "Back",
		"greeting": "Welcome {{name}}!",
		"orderOnline": "ORDER ONLINE",
		"tabs": {
			"delivery": "Delivery",
			"pickup": "Pickup"
		},
		"fields": {
			"city": "City",
			"street": "Street",
			"houseNumber": "House number",
			"apartmentNumber": "Apartment number"
		},
		"actions": {
			"next": "NEXT",
			"findStore": "FIND STORE",
			"findOnMap": "SELECT ON MAP"
		},
		"pickup": { "subtitle": "Enter your address and we'll find the nearest location:" }
	}
};
var common_default = {
	nav: {
		"menuAndPromotions": "Menü & Angebote",
		"locations": "Standorte",
		"trackOrder": "Bestellung verfolgen",
		"blog": "Blog",
		"work": "Jobs",
		"contact": "Kontakt"
	},
	login: "ANMELDEN",
	logout: "ABMELDEN",
	actions: {
		"favorites": "Favoriten",
		"cart": "Warenkorb"
	},
	gallery: {
		"prevButton": "Vorherige Aktion",
		"nextButton": "Nächste Aktion",
		"goToSlide": "Zu Folie {{n}} wechseln"
	},
	homePage: { "cta": {
		"orderOnline": "ONLINE BESTELLEN",
		"menuAndPromos": "MENÜ & AKTIONEN"
	} },
	auth: {
		"modal": {
			"title": "ANMELDUNG",
			"close": "Schließen",
			"createAccount": "Konto erstellen",
			"signIn": "Anmelden",
			"registrationComing": "Registrierung — demnächst"
		},
		"form": {
			"email": "E-Mail",
			"password": "Passwort",
			"resetLink": "Passwort zurücksetzen",
			"submit": "ANMELDEN",
			"submitting": "Anmeldung...",
			"errorFallback": "Ungültige E-Mail oder falsches Passwort"
		}
	},
	notFoundPage: {
		"title": "Diese Seite ist noch im Aufbau",
		"subtitle": "Komm bald wieder!"
	},
	orderPanel: {
		"back": "Zurück",
		"greeting": "Willkommen {{name}}!",
		"orderOnline": "ONLINE BESTELLEN",
		"tabs": {
			"delivery": "Lieferung",
			"pickup": "Abholung"
		},
		"fields": {
			"city": "Stadt",
			"street": "Straße",
			"houseNumber": "Hausnummer",
			"apartmentNumber": "Wohnungsnummer"
		},
		"actions": {
			"next": "WEITER",
			"findStore": "FILIALE FINDEN",
			"findOnMap": "AUF DER KARTE WÄHLEN"
		},
		"pickup": { "subtitle": "Gib deine Adresse ein und wir finden die nächste Filiale:" }
	}
};
//#endregion
//#region src/lib/i18n.ts
var SUPPORTED_LANGUAGES = [
	"pl",
	"en",
	"de"
];
var LANG_STORAGE_KEY = "i18n-lang";
function isLanguage(value) {
	return SUPPORTED_LANGUAGES.includes(value);
}
var getInitialLanguage = () => {
	if (typeof window === "undefined") return "pl";
	const saved = localStorage.getItem(LANG_STORAGE_KEY);
	return isLanguage(saved) ? saved : "pl";
};
if (!i18n.isInitialized) i18n.use(initReactI18next).init({
	lng: getInitialLanguage(),
	fallbackLng: "pl",
	ns: ["common"],
	defaultNS: "common",
	resources: {
		pl: { common: common_default$2 },
		en: { common: common_default$1 },
		de: { common: common_default }
	},
	interpolation: { escapeValue: false },
	react: { useSuspense: false }
});
//#endregion
//#region src/routes/__root.tsx
var Route$4 = createRootRoute({
	loader: () => getServerAuthState(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "TanStack Start Starter" }
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	return /* @__PURE__ */ jsx(AuthProvider, {
		initialAuthState: Route$4.useLoaderData(),
		children: /* @__PURE__ */ jsx(Outlet, {})
	});
}
//#endregion
//#region src/images/logo_sracz.svg
var logo_sracz_default = "/assets/logo_sracz-C6ZX3u7y.svg";
var style_module_default$20 = {
	link: "_link_1vfst_1",
	img: "_img_1vfst_17"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/Logo/index.tsx
var Logo = () => {
	return /* @__PURE__ */ jsx("a", {
		href: "/",
		className: style_module_default$20.link,
		children: /* @__PURE__ */ jsx("img", {
			src: logo_sracz_default,
			alt: "Domino's Pizza",
			className: style_module_default$20.img
		})
	});
};
var style_module_default$19 = {
	link: "_link_19eh1_1",
	drawerLink: "_drawerLink_19eh1_15",
	linkActive: "_linkActive_19eh1_29",
	linkDisabled: "_linkDisabled_19eh1_33",
	drawerLinkDisabled: "_drawerLinkDisabled_19eh1_44"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/HeaderItem/index.tsx
var HeaderItem = ({ translationKey, to, disabled, onClick, variant = "nav" }) => {
	const { t } = useTranslation("common");
	const isDrawerVariant = variant === "drawer";
	if (disabled) return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("span", {
		className: isDrawerVariant ? style_module_default$19.drawerLinkDisabled : style_module_default$19.linkDisabled,
		children: t(translationKey)
	}) });
	return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
		to,
		className: isDrawerVariant ? style_module_default$19.drawerLink : style_module_default$19.link,
		activeProps: { className: style_module_default$19.linkActive },
		onClick,
		children: t(translationKey)
	}) });
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/data.ts
var NAV_ITEMS = [
	{
		key: "nav.menuAndPromotions",
		to: "/menu",
		disabled: true
	},
	{
		key: "nav.locations",
		to: "/locations",
		disabled: true
	},
	{
		key: "nav.trackOrder",
		to: "/track-order",
		disabled: true
	},
	{
		key: "nav.blog",
		to: "/blog",
		disabled: true
	},
	{
		key: "nav.work",
		to: "/jobs",
		disabled: true
	},
	{
		key: "nav.contact",
		to: "/contact",
		disabled: true
	}
];
var style_module_default$18 = { list: "_list_nti0j_1" };
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/HeaderList/index.tsx
var HeaderList = () => {
	return /* @__PURE__ */ jsx("ul", {
		className: style_module_default$18.list,
		children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsx(HeaderItem, {
			translationKey: item.key,
			to: item.to,
			disabled: item.disabled
		}, item.key))
	});
};
var style_module_default$17 = {
	btn: "_btn_7l5sh_1",
	label: "_label_7l5sh_23"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/LoginButton/index.tsx
var LoginButton = ({ label, onClick, disabled }) => /* @__PURE__ */ jsxs("button", {
	type: "button",
	className: style_module_default$17.btn,
	onClick,
	disabled,
	children: [/* @__PURE__ */ jsxs("span", {
		className: style_module_default$17.label,
		children: [label, " →"]
	}), /* @__PURE__ */ jsx(User, {
		size: 20,
		strokeWidth: 1.75
	})]
});
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/data.ts
var LANGUAGES = [
	{
		code: "pl",
		label: "PL"
	},
	{
		code: "en",
		label: "EN"
	},
	{
		code: "de",
		label: "DE"
	}
];
var style_module_default$16 = {
	wrapper: "_wrapper_6anuo_1",
	trigger: "_trigger_6anuo_5",
	chevron: "_chevron_6anuo_21",
	chevronOpen: "_chevronOpen_6anuo_26",
	dropdown: "_dropdown_6anuo_32",
	option: "_option_6anuo_47",
	optionActive: "_optionActive_6anuo_66",
	flagsRow: "_flagsRow_6anuo_71",
	flagBtn: "_flagBtn_6anuo_77",
	flagBtnActive: "_flagBtnActive_6anuo_91"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/LanguageSelector/index.tsx
var FLAG = {
	pl: "🇵🇱",
	en: "🇬🇧",
	de: "🇩🇪"
};
var LanguageSelector = ({ variant = "dropdown" }) => {
	const { i18n } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const activeLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];
	const handleSelect = (code) => {
		i18n.changeLanguage(code);
		localStorage.setItem(LANG_STORAGE_KEY, code);
		setIsOpen(false);
	};
	if (variant === "flags") return /* @__PURE__ */ jsx("div", {
		className: style_module_default$16.flagsRow,
		children: LANGUAGES.map((lang) => /* @__PURE__ */ jsx("button", {
			type: "button",
			className: `${style_module_default$16.flagBtn}${lang.code === activeLang.code ? ` ${style_module_default$16.flagBtnActive}` : ""}`,
			onClick: () => handleSelect(lang.code),
			"aria-pressed": lang.code === activeLang.code,
			children: FLAG[lang.code]
		}, lang.code))
	});
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$16.wrapper,
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: style_module_default$16.trigger,
			onClick: () => setIsOpen((prev) => !prev),
			"aria-expanded": isOpen,
			"aria-haspopup": "listbox",
			children: [/* @__PURE__ */ jsx("span", { children: FLAG[activeLang.code] }), /* @__PURE__ */ jsx(ChevronDown, {
				size: 16,
				strokeWidth: 2,
				className: isOpen ? style_module_default$16.chevronOpen : style_module_default$16.chevron
			})]
		}), isOpen && /* @__PURE__ */ jsx("ul", {
			className: style_module_default$16.dropdown,
			role: "listbox",
			children: LANGUAGES.map((lang) => /* @__PURE__ */ jsx("li", {
				role: "option",
				"aria-selected": lang.code === activeLang.code,
				children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: `${style_module_default$16.option}${lang.code === activeLang.code ? ` ${style_module_default$16.optionActive}` : ""}`,
					onClick: () => handleSelect(lang.code),
					children: [/* @__PURE__ */ jsx("span", { children: FLAG[lang.code] }), /* @__PURE__ */ jsx("span", { children: lang.label })]
				})
			}, lang.code))
		})]
	});
};
var style_module_default$15 = {
	btn: "_btn_2v3xo_1",
	overlay: "_overlay_2v3xo_18",
	drawer: "_drawer_2v3xo_25",
	drawerOpen: "_drawerOpen_2v3xo_40",
	drawerLogoWrapper: "_drawerLogoWrapper_2v3xo_44",
	drawerHeader: "_drawerHeader_2v3xo_55",
	closeBtn: "_closeBtn_2v3xo_64",
	drawerLogin: "_drawerLogin_2v3xo_76",
	drawerNav: "_drawerNav_2v3xo_81",
	drawerLang: "_drawerLang_2v3xo_88"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/Hamburger/index.tsx
var Hamburger = () => {
	const [isOpen, setIsOpen] = useState(false);
	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);
	const close = () => setIsOpen(false);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("button", {
			type: "button",
			className: style_module_default$15.btn,
			onClick: () => setIsOpen(true),
			"aria-label": "Open menu",
			"aria-expanded": isOpen,
			children: /* @__PURE__ */ jsx(Menu, {
				size: 28,
				strokeWidth: 1.75
			})
		}),
		isOpen && /* @__PURE__ */ jsx("div", {
			className: style_module_default$15.overlay,
			onClick: close,
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${style_module_default$15.drawer}${isOpen ? ` ${style_module_default$15.drawerOpen}` : ""}`,
			"aria-hidden": !isOpen,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: style_module_default$15.drawerHeader,
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: style_module_default$15.closeBtn,
						onClick: close,
						"aria-label": "Close menu",
						children: /* @__PURE__ */ jsx(X, {
							size: 24,
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ jsx("div", {
						className: style_module_default$15.drawerLogoWrapper,
						children: /* @__PURE__ */ jsx(Logo, {})
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$15.drawerLogin,
					children: /* @__PURE__ */ jsx(LoginButton, {})
				}),
				/* @__PURE__ */ jsx("nav", { children: /* @__PURE__ */ jsx("ul", {
					className: style_module_default$15.drawerNav,
					children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsx(HeaderItem, {
						translationKey: item.key,
						to: item.to,
						disabled: item.disabled,
						variant: "drawer",
						onClick: close
					}, item.key))
				}) }),
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$15.drawerLang,
					children: /* @__PURE__ */ jsx(LanguageSelector, { variant: "flags" })
				})
			]
		})
	] });
};
//#endregion
//#region src/hooks/useAuth.ts
var useAuth = () => useAuthContext();
var style_module_default$14 = { btn: "_btn_e4vqn_1" };
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/FavoritesButton/index.tsx
var FavoritesButton = () => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsx("a", {
		href: "#",
		className: style_module_default$14.btn,
		"aria-label": t("actions.favorites"),
		children: /* @__PURE__ */ jsx(Heart, {
			size: 22,
			strokeWidth: 1.75
		})
	});
};
var style_module_default$13 = { btn: "_btn_e4vqn_1" };
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/CartButton/index.tsx
var CartButton = () => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsx("a", {
		href: "#",
		className: style_module_default$13.btn,
		"aria-label": t("actions.cart"),
		children: /* @__PURE__ */ jsx(ShoppingBasket, {
			size: 22,
			strokeWidth: 1.75
		})
	});
};
var style_module_default$12 = {
	field: "_field_2k8ta_1",
	label: "_label_2k8ta_7",
	required: "_required_2k8ta_13",
	input: "_input_2k8ta_18"
};
//#endregion
//#region src/components/ui/FormField/index.tsx
var FormField = ({ label, name, type = "text", value, onChange, required, placeholder, className }) => /* @__PURE__ */ jsxs("div", {
	className: clsx(style_module_default$12.field, className),
	children: [/* @__PURE__ */ jsxs("label", {
		htmlFor: name,
		className: style_module_default$12.label,
		children: [label, required && /* @__PURE__ */ jsx("span", {
			className: style_module_default$12.required,
			"aria-hidden": "true",
			children: "*"
		})]
	}), /* @__PURE__ */ jsx("input", {
		id: name,
		name,
		type,
		value,
		onChange: (e) => onChange(e.target.value),
		placeholder,
		className: style_module_default$12.input,
		"aria-required": required
	})]
});
var style_module_default$11 = {
	form: "_form_67i3j_1",
	resetLink: "_resetLink_67i3j_7",
	error: "_error_67i3j_23",
	submit: "_submit_67i3j_33"
};
//#endregion
//#region src/components/ui/AuthModal/components/LoginForm/index.tsx
var LoginForm = ({ onSuccess }) => {
	const { t } = useTranslation("common");
	const { login } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
			await login(email, password);
			onSuccess();
			navigate({ to: "/welcome" });
		} catch (err) {
			const message = err?.response?.data?.message;
			setError(message ?? t("auth.form.errorFallback"));
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		className: style_module_default$11.form,
		onSubmit: handleSubmit,
		noValidate: true,
		children: [
			/* @__PURE__ */ jsx(FormField, {
				label: t("auth.form.email"),
				name: "email",
				type: "email",
				value: email,
				onChange: setEmail,
				required: true
			}),
			/* @__PURE__ */ jsx(FormField, {
				label: t("auth.form.password"),
				name: "password",
				type: "password",
				value: password,
				onChange: setPassword,
				required: true
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: style_module_default$11.resetLink,
				children: t("auth.form.resetLink")
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: style_module_default$11.error,
				role: "alert",
				children: error
			}),
			/* @__PURE__ */ jsx("button", {
				type: "submit",
				className: style_module_default$11.submit,
				disabled: isLoading,
				children: isLoading ? t("auth.form.submitting") : t("auth.form.submit")
			})
		]
	});
};
var style_module_default$10 = {
	overlay: "_overlay_1qbjh_1",
	modal: "_modal_1qbjh_12",
	close: "_close_1qbjh_22",
	title: "_title_1qbjh_41",
	tabs: "_tabs_1qbjh_50",
	tab: "_tab_1qbjh_50",
	tabActive: "_tabActive_1qbjh_73",
	content: "_content_1qbjh_78",
	empty: "_empty_1qbjh_82"
};
//#endregion
//#region src/components/ui/AuthModal/index.tsx
var AuthModal = ({ onClose }) => {
	const { t } = useTranslation("common");
	const [activeTab, setActiveTab] = useState("login");
	const overlayRef = useRef(null);
	useEffect(() => {
		const handleKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);
	const handleOverlayClick = (e) => {
		if (e.target === overlayRef.current) onClose();
	};
	return /* @__PURE__ */ jsx("div", {
		className: style_module_default$10.overlay,
		ref: overlayRef,
		onClick: handleOverlayClick,
		children: /* @__PURE__ */ jsxs("div", {
			className: style_module_default$10.modal,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "auth-modal-title",
			children: [
				/* @__PURE__ */ jsx("button", {
					className: style_module_default$10.close,
					onClick: onClose,
					"aria-label": t("auth.modal.close"),
					children: /* @__PURE__ */ jsx(X, { size: 20 })
				}),
				/* @__PURE__ */ jsx("h2", {
					className: style_module_default$10.title,
					id: "auth-modal-title",
					children: t("auth.modal.title")
				}),
				/* @__PURE__ */ jsxs("div", {
					className: style_module_default$10.tabs,
					role: "tablist",
					children: [/* @__PURE__ */ jsx("button", {
						role: "tab",
						"aria-selected": activeTab === "register",
						className: `${style_module_default$10.tab} ${activeTab === "register" ? style_module_default$10.tabActive : ""}`,
						onClick: () => setActiveTab("register"),
						children: t("auth.modal.createAccount")
					}), /* @__PURE__ */ jsx("button", {
						role: "tab",
						"aria-selected": activeTab === "login",
						className: `${style_module_default$10.tab} ${activeTab === "login" ? style_module_default$10.tabActive : ""}`,
						onClick: () => setActiveTab("login"),
						children: t("auth.modal.signIn")
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$10.content,
					children: activeTab === "login" ? /* @__PURE__ */ jsx(LoginForm, { onSuccess: onClose }) : /* @__PURE__ */ jsx("p", {
						className: style_module_default$10.empty,
						children: t("auth.modal.registrationComing")
					})
				})
			]
		})
	});
};
var style_module_default$9 = {
	panel: "_panel_1wxil_1",
	topRow: "_topRow_1wxil_13",
	bottomRow: "_bottomRow_1wxil_19"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/index.tsx
var LoginPanel = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { user, logout, isLoading } = useAuth();
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$9.panel,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$9.topRow,
				children: [user ? /* @__PURE__ */ jsx(LoginButton, {
					label: t("logout"),
					onClick: logout,
					disabled: isLoading
				}) : /* @__PURE__ */ jsx(LoginButton, {
					label: t("login"),
					onClick: () => setIsModalOpen(true)
				}), /* @__PURE__ */ jsx(LanguageSelector, {})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$9.bottomRow,
				children: [/* @__PURE__ */ jsx(FavoritesButton, {}), /* @__PURE__ */ jsx(CartButton, {})]
			}),
			!user && isModalOpen && /* @__PURE__ */ jsx(AuthModal, { onClose: () => setIsModalOpen(false) })
		]
	});
};
var styles_module_default$1 = {
	header: "_header_y9i4i_1",
	inner: "_inner_y9i4i_10",
	mobileActions: "_mobileActions_y9i4i_26"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/index.tsx
var Header = () => {
	return /* @__PURE__ */ jsx("header", {
		className: styles_module_default$1.header,
		children: /* @__PURE__ */ jsxs("div", {
			className: styles_module_default$1.inner,
			children: [
				/* @__PURE__ */ jsx(Hamburger, {}),
				/* @__PURE__ */ jsx(Logo, {}),
				/* @__PURE__ */ jsx(HeaderList, {}),
				/* @__PURE__ */ jsx(LoginPanel, {}),
				/* @__PURE__ */ jsxs("div", {
					className: styles_module_default$1.mobileActions,
					children: [/* @__PURE__ */ jsx(FavoritesButton, {}), /* @__PURE__ */ jsx(CartButton, {})]
				})
			]
		})
	});
};
var style_module_default$8 = {
	layout: "_layout_1t23e_1",
	main: "_main_1t23e_7"
};
//#endregion
//#region src/layouts/PublicLayout/index.tsx
var PublicLayout = () => {
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$8.layout,
		children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("main", {
			className: style_module_default$8.main,
			children: /* @__PURE__ */ jsx(Outlet, {})
		})]
	});
};
//#endregion
//#region src/routes/_public.tsx
var Route$3 = createFileRoute("/_public")({ component: PublicLayout });
var style_module_default$7 = {
	gallery: "_gallery_c2dar_1",
	track: "_track_c2dar_14",
	slide: "_slide_c2dar_20",
	image: "_image_c2dar_26",
	overlay: "_overlay_c2dar_32",
	subtitle: "_subtitle_c2dar_48",
	title: "_title_c2dar_60",
	price: "_price_c2dar_72",
	prevButton: "_prevButton_c2dar_83",
	nextButton: "_nextButton_c2dar_84",
	dots: "_dots_c2dar_124",
	dot: "_dot_c2dar_124",
	dotActive: "_dotActive_c2dar_134"
};
//#endregion
//#region src/pages/HomePage/components/PromotionsGallery/index.tsx
var PromotionsGallery = ({ promotions }) => {
	const { t } = useTranslation("common");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [autoPlayKey, setAutoPlayKey] = useState(0);
	useEffect(() => {
		const id = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % promotions.length);
		}, 5e3);
		return () => clearInterval(id);
	}, [autoPlayKey, promotions.length]);
	const handleNext = () => {
		setCurrentIndex((prev) => (prev + 1) % promotions.length);
		setAutoPlayKey((k) => k + 1);
	};
	const handlePrev = () => {
		setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
		setAutoPlayKey((k) => k + 1);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$7.gallery,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: style_module_default$7.track,
				style: { transform: `translateX(-${currentIndex * 100}%)` },
				children: promotions.map((promo) => /* @__PURE__ */ jsxs("div", {
					className: style_module_default$7.slide,
					style: { backgroundColor: promo.bgColor },
					children: [/* @__PURE__ */ jsx("img", {
						src: promo.imageUrl,
						alt: promo.title,
						className: style_module_default$7.image
					}), /* @__PURE__ */ jsxs("div", {
						className: style_module_default$7.overlay,
						children: [
							/* @__PURE__ */ jsx("p", {
								className: style_module_default$7.subtitle,
								children: promo.subtitle
							}),
							/* @__PURE__ */ jsx("h2", {
								className: style_module_default$7.title,
								children: promo.title
							}),
							/* @__PURE__ */ jsx("span", {
								className: style_module_default$7.price,
								children: promo.price
							})
						]
					})]
				}, promo.id))
			}),
			/* @__PURE__ */ jsx("button", {
				className: style_module_default$7.prevButton,
				onClick: handlePrev,
				"aria-label": t("gallery.prevButton"),
				children: "‹"
			}),
			/* @__PURE__ */ jsx("button", {
				className: style_module_default$7.nextButton,
				onClick: handleNext,
				"aria-label": t("gallery.nextButton"),
				children: "›"
			}),
			/* @__PURE__ */ jsx("div", {
				className: style_module_default$7.dots,
				children: promotions.map((_, i) => /* @__PURE__ */ jsx("button", {
					className: i === currentIndex ? style_module_default$7.dotActive : style_module_default$7.dot,
					onClick: () => {
						setCurrentIndex(i);
						setAutoPlayKey((k) => k + 1);
					},
					"aria-label": t("gallery.goToSlide", { n: i + 1 })
				}, i))
			})
		]
	});
};
var style_module_default$6 = {
	wrapper: "_wrapper_qkvsb_1",
	orderBtn: "_orderBtn_qkvsb_13",
	menuBtn: "_menuBtn_qkvsb_29"
};
//#endregion
//#region src/pages/HomePage/components/CtaButtons/index.tsx
var CtaButtons = ({ onOrderClick }) => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$6.wrapper,
		children: [/* @__PURE__ */ jsx("button", {
			className: style_module_default$6.orderBtn,
			onClick: onOrderClick,
			children: t("homePage.cta.orderOnline")
		}), /* @__PURE__ */ jsx("button", {
			className: style_module_default$6.menuBtn,
			children: t("homePage.cta.menuAndPromos")
		})]
	});
};
//#endregion
//#region src/hooks/useResizeTransitionBlock.ts
var useResizeTransitionBlock = () => {
	useEffect(() => {
		let timeout;
		const handleResize = () => {
			document.documentElement.classList.add("no-transitions");
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				document.documentElement.classList.remove("no-transitions");
			}, 100);
		};
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			clearTimeout(timeout);
		};
	}, []);
};
var style_module_default$5 = {
	wrapper: "_wrapper_b8gan_1",
	activeIcon: "_activeIcon_b8gan_5",
	activeIconEmoji: "_activeIconEmoji_b8gan_16",
	tabs: "_tabs_b8gan_21",
	tab: "_tab_b8gan_21",
	tabActive: "_tabActive_b8gan_39",
	tabIcon: "_tabIcon_b8gan_45",
	timeBadge: "_timeBadge_b8gan_54",
	tabLabel: "_tabLabel_b8gan_62"
};
//#endregion
//#region src/pages/HomePage/components/OrderPanel/components/TabSwitcher/index.tsx
var TabSwitcher = ({ activeTab, onTabChange }) => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$5.wrapper,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: style_module_default$5.activeIcon,
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx("span", {
					className: style_module_default$5.activeIconEmoji,
					children: activeTab === "delivery" ? "🛵" : "🏪"
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$5.tabs,
				role: "tablist",
				children: [/* @__PURE__ */ jsxs("button", {
					role: "tab",
					"aria-selected": activeTab === "delivery",
					className: clsx(style_module_default$5.tab, activeTab === "delivery" && style_module_default$5.tabActive),
					onClick: () => onTabChange("delivery"),
					children: [
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$5.tabIcon,
							"aria-hidden": "true",
							children: "🛵"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$5.timeBadge,
							children: "~30 min"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$5.tabLabel,
							children: t("orderPanel.tabs.delivery")
						})
					]
				}), /* @__PURE__ */ jsxs("button", {
					role: "tab",
					"aria-selected": activeTab === "pickup",
					className: clsx(style_module_default$5.tab, activeTab === "pickup" && style_module_default$5.tabActive),
					onClick: () => onTabChange("pickup"),
					children: [
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$5.tabIcon,
							"aria-hidden": "true",
							children: "🏪"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$5.timeBadge,
							children: "~15 min"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$5.tabLabel,
							children: t("orderPanel.tabs.pickup")
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", { className: style_module_default$5.indicator })
		]
	});
};
var style_module_default$4 = {
	form: "_form_7y2pf_1",
	row: "_row_7y2pf_7",
	primaryBtn: "_primaryBtn_7y2pf_13"
};
//#endregion
//#region src/pages/HomePage/components/OrderPanel/components/DeliveryForm/index.tsx
var DeliveryForm = () => {
	const { t } = useTranslation("common");
	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [houseNumber, setHouseNumber] = useState("");
	const [apartmentNumber, setApartmentNumber] = useState("");
	const handleSubmit = (e) => {
		e.preventDefault();
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: style_module_default$4.form,
		children: [
			/* @__PURE__ */ jsx(FormField, {
				label: t("orderPanel.fields.city"),
				name: "city",
				value: city,
				onChange: setCity,
				required: true
			}),
			/* @__PURE__ */ jsx(FormField, {
				label: t("orderPanel.fields.street"),
				name: "street",
				value: street,
				onChange: setStreet,
				required: true
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$4.row,
				children: [/* @__PURE__ */ jsx(FormField, {
					label: t("orderPanel.fields.houseNumber"),
					name: "houseNumber",
					value: houseNumber,
					onChange: setHouseNumber,
					required: true
				}), /* @__PURE__ */ jsx(FormField, {
					label: t("orderPanel.fields.apartmentNumber"),
					name: "apartmentNumber",
					value: apartmentNumber,
					onChange: setApartmentNumber
				})]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "submit",
				className: style_module_default$4.primaryBtn,
				children: t("orderPanel.actions.next")
			})
		]
	});
};
var style_module_default$3 = {
	form: "_form_15285_1",
	subtitle: "_subtitle_15285_7",
	row: "_row_15285_13",
	actions: "_actions_15285_19",
	primaryBtn: "_primaryBtn_15285_26",
	secondaryBtn: "_secondaryBtn_15285_42"
};
//#endregion
//#region src/pages/HomePage/components/OrderPanel/components/PickupForm/index.tsx
var PickupForm = () => {
	const { t } = useTranslation("common");
	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [houseNumber, setHouseNumber] = useState("");
	const [apartmentNumber, setApartmentNumber] = useState("");
	const handleSubmit = (e) => {
		e.preventDefault();
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: style_module_default$3.form,
		children: [
			/* @__PURE__ */ jsx("p", {
				className: style_module_default$3.subtitle,
				children: t("orderPanel.pickup.subtitle")
			}),
			/* @__PURE__ */ jsx(FormField, {
				label: t("orderPanel.fields.city"),
				name: "pickup-city",
				value: city,
				onChange: setCity,
				required: true
			}),
			/* @__PURE__ */ jsx(FormField, {
				label: t("orderPanel.fields.street"),
				name: "pickup-street",
				value: street,
				onChange: setStreet,
				required: true
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$3.row,
				children: [/* @__PURE__ */ jsx(FormField, {
					label: t("orderPanel.fields.houseNumber"),
					name: "pickup-houseNumber",
					value: houseNumber,
					onChange: setHouseNumber,
					required: true
				}), /* @__PURE__ */ jsx(FormField, {
					label: t("orderPanel.fields.apartmentNumber"),
					name: "pickup-apartmentNumber",
					value: apartmentNumber,
					onChange: setApartmentNumber
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$3.actions,
				children: [/* @__PURE__ */ jsx("button", {
					type: "submit",
					className: style_module_default$3.primaryBtn,
					children: t("orderPanel.actions.next")
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: style_module_default$3.secondaryBtn,
					onClick: () => console.log("find on map"),
					children: t("orderPanel.actions.findOnMap")
				})]
			})
		]
	});
};
var style_module_default$2 = {
	panel: "_panel_k3dvv_1",
	panelOpen: "_panelOpen_k3dvv_31",
	mobileHeader: "_mobileHeader_k3dvv_36",
	backBtn: "_backBtn_k3dvv_48",
	mobileTitle: "_mobileTitle_k3dvv_58",
	desktopHeader: "_desktopHeader_k3dvv_65",
	greeting: "_greeting_k3dvv_79",
	orderOnline: "_orderOnline_k3dvv_85"
};
//#endregion
//#region src/pages/HomePage/components/OrderPanel/index.tsx
var OrderPanel = ({ isOpen, onClose }) => {
	const { t } = useTranslation("common");
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("delivery");
	useResizeTransitionBlock();
	return /* @__PURE__ */ jsxs("div", {
		className: clsx(style_module_default$2.panel, isOpen && style_module_default$2.panelOpen),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$2.mobileHeader,
				children: [/* @__PURE__ */ jsx("button", {
					className: style_module_default$2.backBtn,
					onClick: onClose,
					"aria-label": t("orderPanel.back"),
					children: "←"
				}), /* @__PURE__ */ jsx("span", {
					className: style_module_default$2.mobileTitle,
					children: t("orderPanel.orderOnline")
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$2.desktopHeader,
				children: [user && /* @__PURE__ */ jsx("span", {
					className: style_module_default$2.greeting,
					children: t("orderPanel.greeting", { name: user.firstName })
				}), /* @__PURE__ */ jsx("span", {
					className: style_module_default$2.orderOnline,
					children: t("orderPanel.orderOnline")
				})]
			}),
			/* @__PURE__ */ jsx(TabSwitcher, {
				activeTab,
				onTabChange: setActiveTab
			}),
			activeTab === "delivery" ? /* @__PURE__ */ jsx(DeliveryForm, {}) : /* @__PURE__ */ jsx(PickupForm, {})
		]
	});
};
//#endregion
//#region src/pages/HomePage/data.ts
var PROMOTIONS = [
	{
		id: 1,
		title: "Pizza Margherita",
		subtitle: "Klasyk w najlepszym wydaniu",
		price: "od 29 zł",
		imageUrl: "https://picsum.photos/seed/promo1/800/450",
		bgColor: "#1a1a2e"
	},
	{
		id: 2,
		title: "Pizza Pepperoni",
		subtitle: "Ostra i chrupiąca",
		price: "od 34 zł",
		imageUrl: "https://picsum.photos/seed/promo2/800/450",
		bgColor: "#16213e"
	},
	{
		id: 3,
		title: "Pizza Quattro Formaggi",
		subtitle: "Cztery sery, jeden zachwyt",
		price: "od 37 zł",
		imageUrl: "https://picsum.photos/seed/promo3/800/450",
		bgColor: "#0f3460"
	},
	{
		id: 4,
		title: "Pizza BBQ",
		subtitle: "Grillowany smak w każdym kawałku",
		price: "od 36 zł",
		imageUrl: "https://picsum.photos/seed/promo4/800/450",
		bgColor: "#1b1b2f"
	},
	{
		id: 5,
		title: "Pizza Hawajska",
		subtitle: "Słodko-słony duet",
		price: "od 33 zł",
		imageUrl: "https://picsum.photos/seed/promo5/800/450",
		bgColor: "#162447"
	},
	{
		id: 6,
		title: "Pizza Diavola",
		subtitle: "Dla miłośników ostrości",
		price: "od 35 zł",
		imageUrl: "https://picsum.photos/seed/promo6/800/450",
		bgColor: "#1f1f3a"
	}
];
var styles_module_default = {
	page: "_page_d6le5_1",
	mainArea: "_mainArea_d6le5_14"
};
//#endregion
//#region src/pages/HomePage/index.tsx
var HomePage = () => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: styles_module_default.page,
		children: [/* @__PURE__ */ jsxs("div", {
			className: styles_module_default.mainArea,
			children: [/* @__PURE__ */ jsx(PromotionsGallery, { promotions: PROMOTIONS }), /* @__PURE__ */ jsx(CtaButtons, { onOrderClick: () => setIsDrawerOpen(true) })]
		}), /* @__PURE__ */ jsx(OrderPanel, {
			isOpen: isDrawerOpen,
			onClose: () => setIsDrawerOpen(false)
		})]
	});
};
//#endregion
//#region src/routes/_public/index.tsx
var Route$2 = createFileRoute("/_public/")({ component: HomePage });
var style_module_default$1 = {
	page: "_page_9s51u_1",
	card: "_card_9s51u_9",
	icon: "_icon_9s51u_24",
	heading: "_heading_9s51u_38",
	name: "_name_9s51u_45",
	sub: "_sub_9s51u_49",
	actions: "_actions_9s51u_55",
	homeBtn: "_homeBtn_9s51u_61",
	logoutBtn: "_logoutBtn_9s51u_77"
};
//#endregion
//#region src/pages/WelcomePage/index.tsx
var WelcomePage = () => {
	const { user, logout, isInitialized } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (isInitialized && !user) navigate({ to: "/" });
	}, [
		isInitialized,
		user,
		navigate
	]);
	if (!isInitialized || !user) return null;
	return /* @__PURE__ */ jsx("div", {
		className: style_module_default$1.page,
		children: /* @__PURE__ */ jsxs("div", {
			className: style_module_default$1.card,
			children: [
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$1.icon,
					children: "✓"
				}),
				/* @__PURE__ */ jsxs("h1", {
					className: style_module_default$1.heading,
					children: [
						"Witaj, ",
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$1.name,
							children: user.firstName
						}),
						"!"
					]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: style_module_default$1.sub,
					children: ["Zalogowano jako ", /* @__PURE__ */ jsx("strong", { children: user.email })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: style_module_default$1.actions,
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: style_module_default$1.homeBtn,
						children: "Przejdź do strony głównej"
					}), /* @__PURE__ */ jsx("button", {
						className: style_module_default$1.logoutBtn,
						onClick: async () => {
							await logout();
						},
						children: "Wyloguj się"
					})]
				})
			]
		})
	});
};
//#endregion
//#region src/routes/_public/welcome.tsx
var Route$1 = createFileRoute("/_public/welcome")({ component: WelcomePage });
var style_module_default = {
	page: "_page_162ed_1",
	code: "_code_162ed_12",
	title: "_title_162ed_24",
	subtitle: "_subtitle_162ed_30"
};
//#endregion
//#region src/pages/NotFoundPage/index.tsx
var NotFoundPage = () => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default.page,
		children: [
			/* @__PURE__ */ jsx("h1", {
				className: style_module_default.code,
				children: "404"
			}),
			/* @__PURE__ */ jsx("p", {
				className: style_module_default.title,
				children: t("notFoundPage.title")
			}),
			/* @__PURE__ */ jsx("p", {
				className: style_module_default.subtitle,
				children: t("notFoundPage.subtitle")
			})
		]
	});
};
//#endregion
//#region src/routes/_public/$.tsx
var Route = createFileRoute("/_public/$")({ component: NotFoundPage });
//#endregion
//#region src/routeTree.gen.ts
var PublicRoute = Route$3.update({
	id: "/_public",
	getParentRoute: () => Route$4
});
var PublicIndexRoute = Route$2.update({
	id: "/",
	path: "/",
	getParentRoute: () => PublicRoute
});
var PublicWelcomeRoute = Route$1.update({
	id: "/welcome",
	path: "/welcome",
	getParentRoute: () => PublicRoute
});
var PublicRouteChildren = {
	PublicSplatRoute: Route.update({
		id: "/$",
		path: "/$",
		getParentRoute: () => PublicRoute
	}),
	PublicWelcomeRoute,
	PublicIndexRoute
};
var rootRouteChildren = { PublicRoute: PublicRoute._addFileChildren(PublicRouteChildren) };
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { getRouter };
