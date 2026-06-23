import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "../server.js";
import { t as AuthProvider } from "./AuthContext-BrZAoc7Z.js";
import "./i18n-YBkKxQG2.js";
import { HeadContent, Outlet, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
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
//#region src/routes/_public.tsx
var $$splitComponentImporter$3 = () => import("./_public-DDZBlmkZ.js");
var Route$3 = createFileRoute("/_public")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
//#endregion
//#region src/routes/_public/index.tsx
var $$splitComponentImporter$2 = () => import("./_public-B0tF0J_2.js");
var Route$2 = createFileRoute("/_public/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
//#endregion
//#region src/routes/_public/welcome.tsx
var $$splitComponentImporter$1 = () => import("./welcome-BIgRqY_g.js");
var Route$1 = createFileRoute("/_public/welcome")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
//#endregion
//#region src/routes/_public/$.tsx
var $$splitComponentImporter = () => import("./_-oPLgv2Eq.js");
var Route = createFileRoute("/_public/$")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
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
