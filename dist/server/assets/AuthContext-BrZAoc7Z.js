import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jsx } from "react/jsx-runtime";
import axios from "axios";
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
export { useAuthContext as n, AuthProvider as t };
