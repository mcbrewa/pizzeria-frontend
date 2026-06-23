import i18n from "i18next";
import { initReactI18next } from "react-i18next";
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
export { LANG_STORAGE_KEY as t };
