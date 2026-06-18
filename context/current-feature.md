# Current Feature

> **Instrukcja dla AI:** Po wczytaniu tego pliku przeczytaj WSZYSTKIE pliki z `context/part-features/`:
> - `context/part-features/01-form-field.md`
> - `context/part-features/02-order-panel-core.md`
> - `context/part-features/03-mobile-drawer.md`
> - `context/part-features/04-desktop-layout.md`
>
> Tam jest pełna specyfikacja techniczna podzielona na iteracje. Ten plik to tylko przegląd.

## Status
Not Started

## Feature: OrderPanel — boczny panel zamówień na HomePage

Panel zamówień z przełącznikiem Dostawa/Odbiór osobisty i formularzem adresu.
- **Desktop**: stała prawa kolumna obok galerii
- **Mobile**: ukryty; otwiera się jako drawer z lewej po tapnięciu "ZAMÓW ONLINE"

Globalne inputy → `src/components/ui/FormField/`

---

## Referencje wizualne

| Screenshot | Co pokazuje |
|---|---|
| `screenshots/orginal view.png` | Desktop: galeria left + panel right, tab Odbiór osobisty |
| `screenshots/formularz_home_page_boczny_dostawa.png` | Desktop: tab Dostawa, pola + przycisk DALEJ |
| `screenshots/panel_odbior.png` | Desktop: tab Odbiór, pola + 2 przyciski |
| `screenshots/szcegoly.png` | Czcionka: Museo Sans 700/500/300 Regular |
| `screenshots/mobile_wersion.png` | Mobile HP: galeria full-width, CTA buttons pod nią |
| `screenshots/mobile_version_zamow_online_one.png` | Mobile: drawer z lewej, tab Dostawa aktywna |
| `screenshots/mobile_version_zamow_online_two.png` | Mobile: drawer, tab Odbiór osobisty aktywna |

---

## Zachowanie: Desktop vs Mobile

### Desktop (≥ 1024px)

- HomePage: CSS Grid 2 kolumny — galeria (lewo, ~65%) + OrderPanel (prawo, ~35%)
- OrderPanel zawsze widoczny, brak CTA buttons
- Header panelu: "Witaj [imię]!" (jeśli zalogowany) + "ZAMÓW ONLINE" (niebieski, pogrubiony)
- Ikony tabów: wewnątrz przycisku taba (skuter / witryna sklepu), małe, z time badge

### Mobile (< 1024px)

- HomePage: galeria full-width, pod nią dwa przyciski CTA
- **CTA buttons** (nowy komponent `CtaButtons`):
  - "ZAMÓW ONLINE" — czerwone tło (`#e2000f`), pełna szerokość, otwiera drawer
  - "MENU I PROMOCJE" — niebieskie tło (`#006491`), pełna szerokość, nawigacja (stub)
- OrderPanel = **drawer wysuwany z lewej** (position: fixed, ~85vw szerokości)
  - Zamknięty: `transform: translateX(-100%)`, niewidoczny
  - Otwarty: `transform: translateX(0)`, przykrywa galerię
- Drawer header: strzałka ← + "ZAMÓW ONLINE" (zamiast powitania)
- **Duża ikona aktywnego taba** (delivery/pickup) wyświetlana nad tabami — zmienia się przy przełączeniu
- Greeting "Witaj [imię]!" — poza zakresem na mobile (nie widać w referencji)

---

## Rozbieżność do rozstrzygnięcia przed implementacją

| | Desktop | Mobile |
|---|---|---|
| Pickup primary button | "ZNAJDŹ LOKAL" | "DALEJ" |
| Pickup secondary button | "WYBIERZ LOKAL NA MAPIE" | "WYBIERZ LOKAL NA MAPIE" |

**Pytanie:** czy PickupForm ma zawsze "DALEJ" + "WYBIERZ LOKAL NA MAPIE" (prostsze, spójne), czy "ZNAJDŹ LOKAL" na desktop i "DALEJ" na mobile? Odpowiedź przed implementacją.

---

## Struktura plików

```
src/
├── components/
│   └── ui/
│       └── FormField/                   # NOWY — globalny labeled input
│           ├── index.tsx
│           ├── types.ts
│           └── style.module.scss
│
└── pages/
    └── HomePage/
        ├── index.tsx                    # MODYFIKACJA: drawer state + layout
        ├── style.module.scss            # MODYFIKACJA: grid desktop + mobile stack
        └── components/
            ├── CtaButtons/              # NOWY — "ZAMÓW ONLINE" + "MENU I PROMOCJE" (mobile)
            │   ├── index.tsx
            │   └── style.module.scss
            └── OrderPanel/              # NOWY — cały panel / drawer
                ├── index.tsx
                ├── types.ts
                ├── style.module.scss
                └── components/
                    ├── TabSwitcher/     # NOWY
                    │   ├── index.tsx
                    │   └── style.module.scss
                    ├── DeliveryForm/    # NOWY
                    │   ├── index.tsx
                    │   └── style.module.scss
                    └── PickupForm/      # NOWY
                        ├── index.tsx
                        └── style.module.scss
```

---

## `HomePage/index.tsx` — zmiany

Nowy stan + przekazanie do dzieci:

```typescript
const [isDrawerOpen, setIsDrawerOpen] = useState(false)
```

JSX szkielet:

```tsx
<div className={styles.page}>
  <div className={styles.mainArea}>
    <PromotionsGallery promotions={PROMOTIONS} />
    <CtaButtons onOrderClick={() => setIsDrawerOpen(true)} />
  </div>
  <OrderPanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
</div>
```

`styles.page` (desktop grid):

```scss
.page {
  // mobile: blok
  display: block;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 380px;  // galeria elastyczna, panel stały 380px
    align-items: start;
  }
}

.mainArea {
  // galeria + CTA buttons razem w jednej komórce gridu
}
```

---

## `CtaButtons/index.tsx`

Widoczne **tylko na mobile** (ukryte CSS na desktop).

### Props

```typescript
interface CtaButtonsProps {
  onOrderClick: () => void
}
```

### JSX

```tsx
<div className={styles.wrapper}>
  <button className={styles.orderBtn} onClick={onOrderClick}>
    {t('homePage.cta.orderOnline')}
  </button>
  <button className={styles.menuBtn}>
    {t('homePage.cta.menuAndPromos')}
  </button>
</div>
```

### style.module.scss

```scss
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;

  @media (min-width: 1024px) {
    display: none;  // ukryte na desktop — panel zawsze widoczny
  }
}

.orderBtn {
  background: #e2000f;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.875rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.menuBtn {
  background: #006491;
  color: #fff;
  // analogicznie
}
```

---

## `OrderPanel/index.tsx`

### types.ts

```typescript
export type OrderTab = 'delivery' | 'pickup'

export interface OrderPanelProps {
  isOpen: boolean       // mobile: kontroluje drawer; desktop: ignorowany (zawsze widoczny)
  onClose: () => void   // mobile: zamknięcie drawera
}
```

### Stan i logika

```typescript
const [activeTab, setActiveTab] = useState<OrderTab>('delivery')
const { user } = useAuth()
```

### JSX

```tsx
<div className={cx(styles.panel, isOpen && styles.panelOpen)}>

  {/* Mobile header z back arrow */}
  <div className={styles.mobileHeader}>
    <button className={styles.backBtn} onClick={onClose} aria-label={t('orderPanel.back')}>
      ←
    </button>
    <span className={styles.mobileTitle}>{t('orderPanel.orderOnline')}</span>
  </div>

  {/* Desktop header z powitaniem */}
  <div className={styles.desktopHeader}>
    {user && <span className={styles.greeting}>{t('orderPanel.greeting', { name: user.firstName })}</span>}
    <span className={styles.orderOnline}>{t('orderPanel.orderOnline')}</span>
  </div>

  <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

  {activeTab === 'delivery' ? <DeliveryForm /> : <PickupForm />}

</div>
```

### style.module.scss — mobile drawer

```scss
.panel {
  background: #fff;
  padding: 1.5rem;

  // Mobile: drawer position (ukryty domyślnie)
  @media (max-width: 1023px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 85vw;
    max-width: 400px;
    z-index: 200;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
  }

  @media (min-width: 1024px) {
    // Desktop: normalny flow, bez position
    position: static;
    transform: none;
    height: auto;
    box-shadow: none;
    border-left: 1px solid var(--border);
  }
}

.panelOpen {
  @media (max-width: 1023px) {
    transform: translateX(0);
  }
}

// Mobile header — widoczny tylko na mobile
.mobileHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 1024px) {
    display: none;
  }
}

// Desktop header — widoczny tylko na desktop
.desktopHeader {
  display: none;
  text-align: center;
  margin-bottom: 1rem;

  @media (min-width: 1024px) {
    display: block;
  }
}

.greeting {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--foreground);
}

.orderOnline {
  font-weight: 700;
  color: #006491;   // Dominos niebieski
  font-size: 1.125rem;
}
```

---

## `TabSwitcher/index.tsx`

### Wygląd (różny desktop vs mobile)

**Desktop**: ikona + time badge + label — wszystko wewnątrz przycisku taba, side-by-side

**Mobile**: duża ikona aktywnego taba wyświetlana **nad** tabami (centered), zmienia się przy przełączeniu

```tsx
const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className={styles.wrapper}>
      {/* Mobile: duża ikona aktywnego taba */}
      <div className={styles.activeIcon} aria-hidden="true">
        <img
          src={activeTab === 'delivery' ? '/icons/delivery.svg' : '/icons/pickup.svg'}
          alt=""
        />
      </div>

      {/* Tabs row */}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'delivery'}
          className={activeTab === 'delivery' ? styles.tabActive : styles.tab}
          onClick={() => onTabChange('delivery')}
        >
          <span className={styles.tabIcon} aria-hidden="true">
            <img src="/icons/delivery.svg" alt="" />
          </span>
          <span className={styles.timeBadge}>~30 min</span>
          <span className={styles.tabLabel}>{t('orderPanel.tabs.delivery')}</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'pickup'}
          className={activeTab === 'pickup' ? styles.tabActive : styles.tab}
          onClick={() => onTabChange('pickup')}
        >
          <span className={styles.tabIcon} aria-hidden="true">
            <img src="/icons/pickup.svg" alt="" />
          </span>
          <span className={styles.timeBadge}>~15 min</span>
          <span className={styles.tabLabel}>{t('orderPanel.tabs.pickup')}</span>
        </button>
      </div>

      {/* Tab indicator line */}
      <div className={styles.indicator} />
    </div>
  )
}
```

### style.module.scss (kluczowe)

```scss
// Duża ikona — widoczna tylko na mobile
.activeIcon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  img { width: 64px; height: auto; }

  @media (min-width: 1024px) {
    display: none;
  }
}

// Ikona wewnątrz taba — ukryta na mobile (bo jest activeIcon powyżej), widoczna na desktop
.tabIcon {
  @media (max-width: 1023px) {
    display: none;
  }
  img { width: 32px; }
}

.tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
}

.tab, .tabActive {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.tabActive {
  color: #006491;
  border-bottom: 3px solid #006491;
  margin-bottom: -2px;   // przykrywa border tabs
}

.timeBadge {
  font-size: 0.65rem;
  background: #e2000f;
  color: #fff;
  border-radius: 999px;
  padding: 0 0.35rem;
}

.tabLabel {
  font-size: 0.875rem;
  font-weight: 700;
}
```

**Uwaga do implementacji:** Jeśli ikon SVG brak w projekcie, zastąp `<img>` emoji (🛵 dla dostawy, 🏪 dla odbioru) — podmiana ikon to 5 minut bez zmiany logiki.

---

## `FormField/index.tsx` — globalny komponent UI

```typescript
// types.ts
export interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}
```

```tsx
// index.tsx
const FormField = ({ label, name, value, onChange, required, placeholder, className }: FormFieldProps) => (
  <div className={cx(styles.field, className)}>
    <label htmlFor={name} className={styles.label}>
      {label}
      {required && <span className={styles.required} aria-hidden="true">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={styles.input}
      aria-required={required}
    />
  </div>
)
```

```scss
// style.module.scss
.field { display: flex; flex-direction: column; gap: 0.25rem; }

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
}

.required { color: #e2000f; margin-left: 2px; }

.input {
  height: 44px;
  padding: 0 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #006491;
    box-shadow: 0 0 0 2px rgba(0, 100, 145, 0.2);
  }
}
```

---

## `DeliveryForm/index.tsx`

Układ pól:

```
Miasto*           [full width]
Ulica*            [full width]
Numer domu*  [~48%]   Numer mieszkania  [~48%]
[        DALEJ        ]  (full width, primary button)
```

```tsx
const DeliveryForm = () => {
  const { t } = useTranslation('common')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [apartmentNumber, setApartmentNumber] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: nawigacja do listy lokali
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FormField label={t('orderPanel.fields.city')} name="city" value={city} onChange={setCity} required />
      <FormField label={t('orderPanel.fields.street')} name="street" value={street} onChange={setStreet} required />
      <div className={styles.row}>
        <FormField label={t('orderPanel.fields.houseNumber')} name="houseNumber" value={houseNumber} onChange={setHouseNumber} required />
        <FormField label={t('orderPanel.fields.apartmentNumber')} name="apartmentNumber" value={apartmentNumber} onChange={setApartmentNumber} />
      </div>
      <button type="submit" className={styles.primaryBtn}>{t('orderPanel.actions.next')}</button>
    </form>
  )
}
```

---

## `PickupForm/index.tsx`

Różnice vs DeliveryForm:
- Subtitle powyżej pól
- Dwa przyciski pod polami (primary filled + secondary outline)
- Rozstrzygnięcie labelu primary button → patrz sekcja "Rozbieżność do rozstrzygnięcia"

```tsx
<form onSubmit={handleSubmit} className={styles.form}>
  <p className={styles.subtitle}>{t('orderPanel.pickup.subtitle')}</p>
  {/* te same 4 pola co DeliveryForm */}
  <div className={styles.actions}>
    <button type="submit" className={styles.primaryBtn}>
      {t('orderPanel.actions.next')}         {/* lub findStore — do decyzji */}
    </button>
    <button type="button" className={styles.secondaryBtn}>
      {t('orderPanel.actions.findOnMap')}
    </button>
  </div>
</form>
```

---

## i18n — klucze do dodania

Pliki: `src/locales/pl/common.json`, `en/common.json`, `de/common.json`

### PL

```json
{
  "homePage": {
    "cta": {
      "orderOnline": "ZAMÓW ONLINE",
      "menuAndPromos": "MENU I PROMOCJE"
    }
  },
  "orderPanel": {
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
    "pickup": {
      "subtitle": "Podaj adres, a znajdziemy najbliższy lokal:"
    }
  }
}
```

### EN

```json
{
  "homePage": {
    "cta": {
      "orderOnline": "ORDER ONLINE",
      "menuAndPromos": "MENU & PROMOTIONS"
    }
  },
  "orderPanel": {
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
    "pickup": {
      "subtitle": "Enter your address and we'll find the nearest location:"
    }
  }
}
```

### DE

```json
{
  "homePage": {
    "cta": {
      "orderOnline": "ONLINE BESTELLEN",
      "menuAndPromos": "MENÜ & AKTIONEN"
    }
  },
  "orderPanel": {
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
    "pickup": {
      "subtitle": "Gib deine Adresse ein und wir finden die nächste Filiale:"
    }
  }
}
```

---

## Kolejność implementacji

1. **`FormField`** — fundament, testy że inputy działają
2. **`TabSwitcher`** — przełącznik z desktop/mobile ikoną
3. **`DeliveryForm`** + **`PickupForm`** — formularze (korzystają z FormField)
4. **`OrderPanel`** — kompletuje panel: header (desktop/mobile), tabs, formularze, drawer CSS
5. **`CtaButtons`** — dwa przyciski CTA (mobile)
6. **`HomePage/index.tsx`** + **`style.module.scss`** — layout grid, drawer state, spajanie
7. **i18n** — klucze PL/EN/DE (dodawać na bieżąco przy każdym komponencie)

---

## Poza zakresem (tej iteracji)

- Nawigacja po submit (wyszukiwanie lokali — osobny feature)
- Integracja z `/api/addresses` (autofill dla zalogowanego)
- Mapa (WYBIERZ LOKAL NA MAPIE — stub, onClick = console.log)
- SVG ikony tabów — emoji placeholder dozwolony
- Overlay/backdrop za mobile drawerem (nice-to-have, nie blokuje)
- Blokowanie scroll body gdy drawer otwarty (nice-to-have)

---

## Historia

### PromotionsGallery — 2026-06-17
Slider promocji na HomePage. 6 slajdów, auto-advance 5s, strzałki, dots-indicator. Pure presentation, dane przez props z `data.ts`. Zmergowane do main.

### LoginPanel — 2026-06-17
Header action panel: LoginButton (modal stub), LanguageSelector (PL/EN/DE, i18n.changeLanguage), FavoritesButton, CartButton. Mobile drawer z nawigacją i przełącznikiem języka. Zmergowane do main.

### OrderPanel — 2026-06-18
Panel zamówień na HomePage. Desktop: stała prawa kolumna (grid 1fr 380px). Mobile: drawer z lewej (translateX, 85vw). TabSwitcher z emoji (🛵/🏪), DeliveryForm i PickupForm (FormField + i18n PL/EN/DE). useAuth stub. Fix animacji przy resize (useResizeTransitionBlock + html.no-transitions). Zmergowane do main.
