import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
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
//#region src/routes/_public/$.tsx?tsr-split=component
var SplitComponent = NotFoundPage;
//#endregion
export { SplitComponent as component };
