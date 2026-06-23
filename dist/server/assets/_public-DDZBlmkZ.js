import { t as LANG_STORAGE_KEY } from "./i18n-YBkKxQG2.js";
import { t as useAuth } from "./useAuth-2preQRNU.js";
import { t as FormField } from "./FormField-CiTDrUGt.js";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { ChevronDown, Heart, Menu, ShoppingBasket, User, X } from "lucide-react";
//#region src/images/logo_sracz.svg
var logo_sracz_default = "/assets/logo_sracz-C6ZX3u7y.svg";
var style_module_default$11 = {
	link: "_link_1vfst_1",
	img: "_img_1vfst_17"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/Logo/index.tsx
var Logo = () => {
	return /* @__PURE__ */ jsx("a", {
		href: "/",
		className: style_module_default$11.link,
		children: /* @__PURE__ */ jsx("img", {
			src: logo_sracz_default,
			alt: "Domino's Pizza",
			className: style_module_default$11.img
		})
	});
};
var style_module_default$10 = {
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
		className: isDrawerVariant ? style_module_default$10.drawerLinkDisabled : style_module_default$10.linkDisabled,
		children: t(translationKey)
	}) });
	return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
		to,
		className: isDrawerVariant ? style_module_default$10.drawerLink : style_module_default$10.link,
		activeProps: { className: style_module_default$10.linkActive },
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
var style_module_default$9 = { list: "_list_nti0j_1" };
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/HeaderList/index.tsx
var HeaderList = () => {
	return /* @__PURE__ */ jsx("ul", {
		className: style_module_default$9.list,
		children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsx(HeaderItem, {
			translationKey: item.key,
			to: item.to,
			disabled: item.disabled
		}, item.key))
	});
};
var style_module_default$8 = {
	btn: "_btn_7l5sh_1",
	label: "_label_7l5sh_23"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/LoginButton/index.tsx
var LoginButton = ({ label, onClick, disabled }) => /* @__PURE__ */ jsxs("button", {
	type: "button",
	className: style_module_default$8.btn,
	onClick,
	disabled,
	children: [/* @__PURE__ */ jsxs("span", {
		className: style_module_default$8.label,
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
var style_module_default$7 = {
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
		className: style_module_default$7.flagsRow,
		children: LANGUAGES.map((lang) => /* @__PURE__ */ jsx("button", {
			type: "button",
			className: `${style_module_default$7.flagBtn}${lang.code === activeLang.code ? ` ${style_module_default$7.flagBtnActive}` : ""}`,
			onClick: () => handleSelect(lang.code),
			"aria-pressed": lang.code === activeLang.code,
			children: FLAG[lang.code]
		}, lang.code))
	});
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$7.wrapper,
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: style_module_default$7.trigger,
			onClick: () => setIsOpen((prev) => !prev),
			"aria-expanded": isOpen,
			"aria-haspopup": "listbox",
			children: [/* @__PURE__ */ jsx("span", { children: FLAG[activeLang.code] }), /* @__PURE__ */ jsx(ChevronDown, {
				size: 16,
				strokeWidth: 2,
				className: isOpen ? style_module_default$7.chevronOpen : style_module_default$7.chevron
			})]
		}), isOpen && /* @__PURE__ */ jsx("ul", {
			className: style_module_default$7.dropdown,
			role: "listbox",
			children: LANGUAGES.map((lang) => /* @__PURE__ */ jsx("li", {
				role: "option",
				"aria-selected": lang.code === activeLang.code,
				children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: `${style_module_default$7.option}${lang.code === activeLang.code ? ` ${style_module_default$7.optionActive}` : ""}`,
					onClick: () => handleSelect(lang.code),
					children: [/* @__PURE__ */ jsx("span", { children: FLAG[lang.code] }), /* @__PURE__ */ jsx("span", { children: lang.label })]
				})
			}, lang.code))
		})]
	});
};
var style_module_default$6 = {
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
			className: style_module_default$6.btn,
			onClick: () => setIsOpen(true),
			"aria-label": "Open menu",
			"aria-expanded": isOpen,
			children: /* @__PURE__ */ jsx(Menu, {
				size: 28,
				strokeWidth: 1.75
			})
		}),
		isOpen && /* @__PURE__ */ jsx("div", {
			className: style_module_default$6.overlay,
			onClick: close,
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: `${style_module_default$6.drawer}${isOpen ? ` ${style_module_default$6.drawerOpen}` : ""}`,
			"aria-hidden": !isOpen,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: style_module_default$6.drawerHeader,
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: style_module_default$6.closeBtn,
						onClick: close,
						"aria-label": "Close menu",
						children: /* @__PURE__ */ jsx(X, {
							size: 24,
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ jsx("div", {
						className: style_module_default$6.drawerLogoWrapper,
						children: /* @__PURE__ */ jsx(Logo, {})
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$6.drawerLogin,
					children: /* @__PURE__ */ jsx(LoginButton, {})
				}),
				/* @__PURE__ */ jsx("nav", { children: /* @__PURE__ */ jsx("ul", {
					className: style_module_default$6.drawerNav,
					children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsx(HeaderItem, {
						translationKey: item.key,
						to: item.to,
						disabled: item.disabled,
						variant: "drawer",
						onClick: close
					}, item.key))
				}) }),
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$6.drawerLang,
					children: /* @__PURE__ */ jsx(LanguageSelector, { variant: "flags" })
				})
			]
		})
	] });
};
var style_module_default$5 = { btn: "_btn_e4vqn_1" };
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/FavoritesButton/index.tsx
var FavoritesButton = () => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsx("a", {
		href: "#",
		className: style_module_default$5.btn,
		"aria-label": t("actions.favorites"),
		children: /* @__PURE__ */ jsx(Heart, {
			size: 22,
			strokeWidth: 1.75
		})
	});
};
var style_module_default$4 = { btn: "_btn_e4vqn_1" };
//#endregion
//#region src/layouts/PublicLayout/components/Header/components/LoginPanel/components/CartButton/index.tsx
var CartButton = () => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsx("a", {
		href: "#",
		className: style_module_default$4.btn,
		"aria-label": t("actions.cart"),
		children: /* @__PURE__ */ jsx(ShoppingBasket, {
			size: 22,
			strokeWidth: 1.75
		})
	});
};
var style_module_default$3 = {
	form: "_form_67i3j_1",
	resetLink: "_resetLink_67i3j_7",
	error: "_error_67i3j_23",
	submit: "_submit_67i3j_33"
};
//#endregion
//#region src/components/ui/AuthModal/components/LoginForm/index.tsx
var LoginForm = ({ onSuccess }) => {
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
			setError(message ?? "Nieprawidłowy email lub hasło");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		className: style_module_default$3.form,
		onSubmit: handleSubmit,
		noValidate: true,
		children: [
			/* @__PURE__ */ jsx(FormField, {
				label: "Email",
				name: "email",
				type: "email",
				value: email,
				onChange: setEmail,
				required: true
			}),
			/* @__PURE__ */ jsx(FormField, {
				label: "Hasło",
				name: "password",
				type: "password",
				value: password,
				onChange: setPassword,
				required: true
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: style_module_default$3.resetLink,
				children: "link do resetu hasła"
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: style_module_default$3.error,
				role: "alert",
				children: error
			}),
			/* @__PURE__ */ jsx("button", {
				type: "submit",
				className: style_module_default$3.submit,
				disabled: isLoading,
				children: isLoading ? "Logowanie..." : "ZALOGUJ SIĘ"
			})
		]
	});
};
var style_module_default$2 = {
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
		className: style_module_default$2.overlay,
		ref: overlayRef,
		onClick: handleOverlayClick,
		children: /* @__PURE__ */ jsxs("div", {
			className: style_module_default$2.modal,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "auth-modal-title",
			children: [
				/* @__PURE__ */ jsx("button", {
					className: style_module_default$2.close,
					onClick: onClose,
					"aria-label": "Zamknij",
					children: /* @__PURE__ */ jsx(X, { size: 20 })
				}),
				/* @__PURE__ */ jsx("h2", {
					className: style_module_default$2.title,
					id: "auth-modal-title",
					children: "LOGOWANIE"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: style_module_default$2.tabs,
					role: "tablist",
					children: [/* @__PURE__ */ jsx("button", {
						role: "tab",
						"aria-selected": activeTab === "register",
						className: `${style_module_default$2.tab} ${activeTab === "register" ? style_module_default$2.tabActive : ""}`,
						onClick: () => setActiveTab("register"),
						children: "Załóż konto"
					}), /* @__PURE__ */ jsx("button", {
						role: "tab",
						"aria-selected": activeTab === "login",
						className: `${style_module_default$2.tab} ${activeTab === "login" ? style_module_default$2.tabActive : ""}`,
						onClick: () => setActiveTab("login"),
						children: "Zaloguj się"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: style_module_default$2.content,
					children: activeTab === "login" ? /* @__PURE__ */ jsx(LoginForm, { onSuccess: onClose }) : /* @__PURE__ */ jsx("p", {
						className: style_module_default$2.empty,
						children: "Rejestracja — wkrótce"
					})
				})
			]
		})
	});
};
var style_module_default$1 = {
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
		className: style_module_default$1.panel,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$1.topRow,
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
				className: style_module_default$1.bottomRow,
				children: [/* @__PURE__ */ jsx(FavoritesButton, {}), /* @__PURE__ */ jsx(CartButton, {})]
			}),
			!user && isModalOpen && /* @__PURE__ */ jsx(AuthModal, { onClose: () => setIsModalOpen(false) })
		]
	});
};
var styles_module_default = {
	header: "_header_u3z9w_1",
	mobileActions: "_mobileActions_u3z9w_21"
};
//#endregion
//#region src/layouts/PublicLayout/components/Header/index.tsx
var Header = () => {
	return /* @__PURE__ */ jsxs("header", {
		className: styles_module_default.header,
		children: [
			/* @__PURE__ */ jsx(Hamburger, {}),
			/* @__PURE__ */ jsx(Logo, {}),
			/* @__PURE__ */ jsx(HeaderList, {}),
			/* @__PURE__ */ jsx(LoginPanel, {}),
			/* @__PURE__ */ jsxs("div", {
				className: styles_module_default.mobileActions,
				children: [/* @__PURE__ */ jsx(FavoritesButton, {}), /* @__PURE__ */ jsx(CartButton, {})]
			})
		]
	});
};
var style_module_default = {
	layout: "_layout_1t23e_1",
	main: "_main_1t23e_7"
};
//#endregion
//#region src/layouts/PublicLayout/index.tsx
var PublicLayout = () => {
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default.layout,
		children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("main", {
			className: style_module_default.main,
			children: /* @__PURE__ */ jsx(Outlet, {})
		})]
	});
};
//#endregion
//#region src/routes/_public.tsx?tsr-split=component
var SplitComponent = PublicLayout;
//#endregion
export { SplitComponent as component };
