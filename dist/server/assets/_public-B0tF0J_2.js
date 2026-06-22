import { t as useAuth } from "./useAuth-2preQRNU.js";
import { t as FormField } from "./FormField-CiTDrUGt.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
var style_module_default$5 = {
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
		className: style_module_default$5.gallery,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: style_module_default$5.track,
				style: { transform: `translateX(-${currentIndex * 100}%)` },
				children: promotions.map((promo) => /* @__PURE__ */ jsxs("div", {
					className: style_module_default$5.slide,
					style: { backgroundColor: promo.bgColor },
					children: [/* @__PURE__ */ jsx("img", {
						src: promo.imageUrl,
						alt: promo.title,
						className: style_module_default$5.image
					}), /* @__PURE__ */ jsxs("div", {
						className: style_module_default$5.overlay,
						children: [
							/* @__PURE__ */ jsx("p", {
								className: style_module_default$5.subtitle,
								children: promo.subtitle
							}),
							/* @__PURE__ */ jsx("h2", {
								className: style_module_default$5.title,
								children: promo.title
							}),
							/* @__PURE__ */ jsx("span", {
								className: style_module_default$5.price,
								children: promo.price
							})
						]
					})]
				}, promo.id))
			}),
			/* @__PURE__ */ jsx("button", {
				className: style_module_default$5.prevButton,
				onClick: handlePrev,
				"aria-label": t("gallery.prevButton"),
				children: "‹"
			}),
			/* @__PURE__ */ jsx("button", {
				className: style_module_default$5.nextButton,
				onClick: handleNext,
				"aria-label": t("gallery.nextButton"),
				children: "›"
			}),
			/* @__PURE__ */ jsx("div", {
				className: style_module_default$5.dots,
				children: promotions.map((_, i) => /* @__PURE__ */ jsx("button", {
					className: i === currentIndex ? style_module_default$5.dotActive : style_module_default$5.dot,
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
var style_module_default$4 = {
	wrapper: "_wrapper_qkvsb_1",
	orderBtn: "_orderBtn_qkvsb_13",
	menuBtn: "_menuBtn_qkvsb_29"
};
//#endregion
//#region src/pages/HomePage/components/CtaButtons/index.tsx
var CtaButtons = ({ onOrderClick }) => {
	const { t } = useTranslation("common");
	return /* @__PURE__ */ jsxs("div", {
		className: style_module_default$4.wrapper,
		children: [/* @__PURE__ */ jsx("button", {
			className: style_module_default$4.orderBtn,
			onClick: onOrderClick,
			children: t("homePage.cta.orderOnline")
		}), /* @__PURE__ */ jsx("button", {
			className: style_module_default$4.menuBtn,
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
var style_module_default$3 = {
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
		className: style_module_default$3.wrapper,
		children: [
			/* @__PURE__ */ jsx("div", {
				className: style_module_default$3.activeIcon,
				"aria-hidden": "true",
				children: /* @__PURE__ */ jsx("span", {
					className: style_module_default$3.activeIconEmoji,
					children: activeTab === "delivery" ? "🛵" : "🏪"
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default$3.tabs,
				role: "tablist",
				children: [/* @__PURE__ */ jsxs("button", {
					role: "tab",
					"aria-selected": activeTab === "delivery",
					className: clsx(style_module_default$3.tab, activeTab === "delivery" && style_module_default$3.tabActive),
					onClick: () => onTabChange("delivery"),
					children: [
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$3.tabIcon,
							"aria-hidden": "true",
							children: "🛵"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$3.timeBadge,
							children: "~30 min"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$3.tabLabel,
							children: t("orderPanel.tabs.delivery")
						})
					]
				}), /* @__PURE__ */ jsxs("button", {
					role: "tab",
					"aria-selected": activeTab === "pickup",
					className: clsx(style_module_default$3.tab, activeTab === "pickup" && style_module_default$3.tabActive),
					onClick: () => onTabChange("pickup"),
					children: [
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$3.tabIcon,
							"aria-hidden": "true",
							children: "🏪"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$3.timeBadge,
							children: "~15 min"
						}),
						/* @__PURE__ */ jsx("span", {
							className: style_module_default$3.tabLabel,
							children: t("orderPanel.tabs.pickup")
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", { className: style_module_default$3.indicator })
		]
	});
};
var style_module_default$2 = {
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
		className: style_module_default$2.form,
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
				className: style_module_default$2.row,
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
				className: style_module_default$2.primaryBtn,
				children: t("orderPanel.actions.next")
			})
		]
	});
};
var style_module_default$1 = {
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
		className: style_module_default$1.form,
		children: [
			/* @__PURE__ */ jsx("p", {
				className: style_module_default$1.subtitle,
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
				className: style_module_default$1.row,
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
				className: style_module_default$1.actions,
				children: [/* @__PURE__ */ jsx("button", {
					type: "submit",
					className: style_module_default$1.primaryBtn,
					children: t("orderPanel.actions.next")
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: style_module_default$1.secondaryBtn,
					onClick: () => console.log("find on map"),
					children: t("orderPanel.actions.findOnMap")
				})]
			})
		]
	});
};
var style_module_default = {
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
		className: clsx(style_module_default.panel, isOpen && style_module_default.panelOpen),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default.mobileHeader,
				children: [/* @__PURE__ */ jsx("button", {
					className: style_module_default.backBtn,
					onClick: onClose,
					"aria-label": t("orderPanel.back"),
					children: "←"
				}), /* @__PURE__ */ jsx("span", {
					className: style_module_default.mobileTitle,
					children: t("orderPanel.orderOnline")
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: style_module_default.desktopHeader,
				children: [user && /* @__PURE__ */ jsx("span", {
					className: style_module_default.greeting,
					children: t("orderPanel.greeting", { name: user.firstName })
				}), /* @__PURE__ */ jsx("span", {
					className: style_module_default.orderOnline,
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
	page: "_page_6dmqc_1",
	mainArea: "_mainArea_6dmqc_12"
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
//#region src/routes/_public/index.tsx?tsr-split=component
var SplitComponent = HomePage;
//#endregion
export { SplitComponent as component };
