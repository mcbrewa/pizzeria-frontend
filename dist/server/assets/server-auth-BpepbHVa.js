import { a as setResponseHeader, i as getRequest, n as TSS_SERVER_FUNCTION, t as createServerFn } from "../server.js";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/api/server-auth.ts?tss-serverfn-split
var AUTH_API_BASE = process.env.SERVER_AUTH_API_URL ?? "http://localhost:5000/api";
var PIZZERIA_ORG_ID = process.env.VITE_PIZZERIA_ORG_ID;
var getServerAuthState_createServerFn_handler = createServerRpc({
	id: "bb604f702874d060244a7c3f8ce176ebc9993affee63e2bab999e5e6637b32de",
	name: "getServerAuthState",
	filename: "src/api/server-auth.ts"
}, (opts) => getServerAuthState.__executeServer(opts));
var getServerAuthState = createServerFn({ method: "GET" }).handler(getServerAuthState_createServerFn_handler, async () => {
	const cookieHeader = getRequest().headers.get("cookie") ?? "";
	if (!cookieHeader) return null;
	try {
		const refreshRes = await fetch(`${AUTH_API_BASE}/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: cookieHeader
			}
		});
		if (!refreshRes.ok) return null;
		const setCookieHeaders = refreshRes.headers.getSetCookie();
		if (setCookieHeaders.length > 0) setResponseHeader("Set-Cookie", setCookieHeaders);
		const accessToken = (await refreshRes.json()).data?.accessToken;
		if (!accessToken) return null;
		const profileRes = await fetch(`${AUTH_API_BASE}/users/profile`, { headers: { Authorization: `Bearer ${accessToken}` } });
		if (!profileRes.ok) return null;
		const user = (await profileRes.json()).data;
		if (!user) return null;
		if (Boolean(PIZZERIA_ORG_ID) && user.organisationId !== PIZZERIA_ORG_ID) return null;
		console.log("[SSR] getServerAuthState called");
		console.log("[SSR] user:", user.email);
		return {
			user,
			accessToken
		};
	} catch {
		return null;
	}
});
//#endregion
export { getServerAuthState_createServerFn_handler };
