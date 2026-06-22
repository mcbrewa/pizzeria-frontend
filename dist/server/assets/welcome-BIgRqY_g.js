import { t as useAuth } from "./useAuth-2preQRNU.js";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
var style_module_default = {
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
		className: style_module_default.page,
		children: /* @__PURE__ */ jsxs("div", {
			className: style_module_default.card,
			children: [
				/* @__PURE__ */ jsx("div", {
					className: style_module_default.icon,
					children: "✓"
				}),
				/* @__PURE__ */ jsxs("h1", {
					className: style_module_default.heading,
					children: [
						"Witaj, ",
						/* @__PURE__ */ jsx("span", {
							className: style_module_default.name,
							children: user.firstName
						}),
						"!"
					]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: style_module_default.sub,
					children: ["Zalogowano jako ", /* @__PURE__ */ jsx("strong", { children: user.email })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: style_module_default.actions,
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: style_module_default.homeBtn,
						children: "Przejdź do strony głównej"
					}), /* @__PURE__ */ jsx("button", {
						className: style_module_default.logoutBtn,
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
//#region src/routes/_public/welcome.tsx?tsr-split=component
var SplitComponent = WelcomePage;
//#endregion
export { SplitComponent as component };
