# Current Feature

## Status
In Progress

## Feature: PromotionsGallery

Slider promocji na HomePage. Pure presentation component — dane przez props. 6 slajdów, auto-advance co 5s, strzałki lewo/prawo, dots-indicator.

---

## Architektura (Opcja A — pure presentation)

Komponent nie zna źródła danych. Teraz statyczne dane z `data.ts`, w przyszłości loader → API.

```
Teraz:
  HomePage/data.ts  →  HomePage/index.tsx  →  <PromotionsGallery promotions={PROMOTIONS} />

Przyszłość (bez zmian w komponencie):
  GET /api/promotions  →  route loader  →  HomePage/index.tsx  →  <PromotionsGallery promotions={data} />
```

---

## Struktura plików

```
src/pages/HomePage/
├── index.tsx                     # MODYFIKACJA: import PROMOTIONS + <PromotionsGallery>
├── styles.module.scss            # istniejący (pusty)
├── types.ts                      # istniejący (pusty)
├── data.ts                       # NOWY: 6 statycznych obiektów Promotion
└── components/
    └── PromotionsGallery/
        ├── index.tsx             # NOWY: komponent slidera (pure presentation)
        ├── style.module.scss     # NOWY: style SCSS Modules
        └── types.ts             # NOWY: interfejs Promotion
```

---

## Typy (`PromotionsGallery/types.ts`)

Interfejs zaprojektowany pod przyszłe API (pola odpowiadają kształtowi backendu):

```typescript
export interface Promotion {
  id: string | number
  title: string
  subtitle: string
  price: string
  imageUrl: string   // URL obrazka — teraz placeholder, przyszłość: CDN/backend
  bgColor: string    // fallback tło gdy imageUrl nie załaduje
}

export interface PromotionsGalleryProps {
  promotions: Promotion[]
}
```

---

## Dane statyczne (`HomePage/data.ts`)

6 obiektów Promotion z placeholder imageUrl (np. `https://picsum.photos/seed/promo{n}/800/450`).
Pola odpowiadają interfejsowi Promotion — migracja do API = tylko zmiana źródła danych w `index.tsx`.

---

## Komponent (`PromotionsGallery/index.tsx`)

**Props:** `promotions: Promotion[]`  
**Stan:** `currentIndex: number`, `autoPlayKey: number` (trigger resetu timera)

### Logika slidera

```typescript
const [currentIndex, setCurrentIndex] = useState(0)
const [autoPlayKey, setAutoPlayKey] = useState(0)

// Auto-advance — resetuje się gdy zmieni się autoPlayKey (po kliknięciu strzałki)
useEffect(() => {
  const id = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % promotions.length)
  }, 5000)
  return () => clearInterval(id)
}, [autoPlayKey, promotions.length])

const handleNext = () => {
  setCurrentIndex(prev => (prev + 1) % promotions.length)
  setAutoPlayKey(k => k + 1)   // reset timera
}

const handlePrev = () => {
  setCurrentIndex(prev => (prev - 1 + promotions.length) % promotions.length)
  setAutoPlayKey(k => k + 1)   // reset timera
}
```

### JSX skeleton

```tsx
<div className={styles.gallery}>
  <div
    className={styles.track}
    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
  >
    {promotions.map(promo => (
      <div key={promo.id} className={styles.slide} style={{ backgroundColor: promo.bgColor }}>
        <img src={promo.imageUrl} alt={promo.title} className={styles.image} />
        <div className={styles.overlay}>
          <p className={styles.subtitle}>{promo.subtitle}</p>
          <h2 className={styles.title}>{promo.title}</h2>
          <span className={styles.price}>{promo.price}</span>
        </div>
      </div>
    ))}
  </div>

  <button className={styles.prevButton} onClick={handlePrev} aria-label="Poprzednia promocja">‹</button>
  <button className={styles.nextButton} onClick={handleNext} aria-label="Następna promocja">›</button>

  <div className={styles.dots}>
    {promotions.map((_, i) => (
      <button
        key={i}
        className={i === currentIndex ? styles.dotActive : styles.dot}
        onClick={() => { setCurrentIndex(i); setAutoPlayKey(k => k + 1) }}
        aria-label={`Przejdź do slajdu ${i + 1}`}
      />
    ))}
  </div>
</div>
```

---

## Style (`style.module.scss`) — wytyczne

### Podejście animacji
CSS `transform: translateX` — nie JS, nie opacity. Płynna animacja `transition: transform 0.4s ease`.

```scss
.gallery {
  position: relative;
  overflow: hidden;
  width: 100%;
  // mobile: pełna szerokość ekranu
  aspect-ratio: 16 / 9;   // proporcje slajdu

  @media (min-width: 1024px) {
    aspect-ratio: unset;
    height: 500px;        // stała wysokość na desktop
  }
}

.track {
  display: flex;
  height: 100%;
  transition: transform 0.4s ease;
}

.slide {
  flex: 0 0 100%;         // każdy slajd = 100% szerokości track
  position: relative;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
  background: linear-gradient(to right, rgba(0,0,0,0.6) 40%, transparent);

  @media (min-width: 768px) {
    padding: 2.5rem;
  }
}

.title {
  // duże, białe, pogrubione
}

.price {
  // duże, wyróżnione (kolor var(--primary) lub żółty/czerwony zależnie od designu)
}

// Strzałki — absolutne, wycentrowane pionowo
.prevButton, .nextButton {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  // mobilne: małe, widoczne (nie ukrywamy)
  z-index: 2;
}
.prevButton { left: 0.75rem; }
.nextButton { right: 0.75rem; }

// Dots — dół galerii, środek
.dots {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}
.dot, .dotActive {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
}
.dot { background: rgba(255,255,255,0.5); }
.dotActive { background: var(--primary); }
```

### Kolory
- Tekst na obrazku: biały (`#fff`)
- Gradient overlay: `rgba(0,0,0,0.6)` → transparent (lewa strona ciemna jak w screenshocie)
- Strzałki: białe z ciemnym tłem (`rgba(0,0,0,0.4)`) + border-radius
- Dot aktywna: `var(--primary)`, nieaktywna: `rgba(255,255,255,0.5)`

---

## Integracja w `HomePage/index.tsx`

```tsx
import PromotionsGallery from './components/PromotionsGallery'
import { PROMOTIONS } from './data'

const HomePage = () => {
  return (
    <div>
      <PromotionsGallery promotions={PROMOTIONS} />
    </div>
  )
}

export default HomePage
```

---

## Referencje wizualne

- Desktop: `screenshots/home_page_gallery.png` — galeria po lewej, formularz po prawej
- Mobile: `screenshots/mobile_home_page_promotion_gallery.png` — full-width, dots widoczne, duży tekst na obrazku

---

## Poza zakresem

- Przyciski CTA ("ZAMÓW ONLINE", "MENU I PROMOCJE") — osobny komponent HomePage, nie wchodzi tu
- Prawa kolumna z formularzem zamówienia — osobny komponent
- Połączenie z `/api/promotions` — zrobi się gdy będzie backend i panel admina
- Swipe/touch na mobile — nie teraz

---

## Historia

### LoginPanel — 2026-06-17
Header action panel: LoginButton (modal stub), LanguageSelector (PL/EN/DE, i18n.changeLanguage), FavoritesButton, CartButton. Mobile drawer w Hamburgerze z nawigacją i przełącznikiem języka (flagi). Breakpoint xl (1280px) + flex:1 na HeaderList zapobiega i18n overflow. Zmergowane do main.
