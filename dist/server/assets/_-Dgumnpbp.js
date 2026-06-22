import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_public/$.tsx?tsr-split=component
function NotFoundPage() {
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			minHeight: "60vh",
			gap: "1rem",
			textAlign: "center",
			padding: "2rem"
		},
		children: [
			/* @__PURE__ */ jsx("h1", {
				style: {
					fontSize: "4rem",
					fontWeight: 800,
					color: "#e2000f",
					margin: 0
				},
				children: "404"
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					fontSize: "1.25rem",
					fontWeight: 700,
					color: "var(--text)"
				},
				children: "Ta strona jest jeszcze w budowie"
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					color: "var(--text)",
					opacity: .6
				},
				children: "Wróć wkrótce!"
			})
		]
	});
}
//#endregion
export { NotFoundPage as component };
