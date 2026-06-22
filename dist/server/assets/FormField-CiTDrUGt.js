import { jsx, jsxs } from "react/jsx-runtime";
import clsx from "clsx";
var style_module_default = {
	field: "_field_2k8ta_1",
	label: "_label_2k8ta_7",
	required: "_required_2k8ta_13",
	input: "_input_2k8ta_18"
};
//#endregion
//#region src/components/ui/FormField/index.tsx
var FormField = ({ label, name, type = "text", value, onChange, required, placeholder, className }) => /* @__PURE__ */ jsxs("div", {
	className: clsx(style_module_default.field, className),
	children: [/* @__PURE__ */ jsxs("label", {
		htmlFor: name,
		className: style_module_default.label,
		children: [label, required && /* @__PURE__ */ jsx("span", {
			className: style_module_default.required,
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
		className: style_module_default.input,
		"aria-required": required
	})]
});
//#endregion
export { FormField as t };
