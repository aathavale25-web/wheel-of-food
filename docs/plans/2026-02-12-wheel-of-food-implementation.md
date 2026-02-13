# Wheel of Food Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React web app that spins a randomized wheel to pick a nearby takeout restaurant using Google Places API.

**Architecture:** Single-page React app (Vite + TypeScript) with no backend. Browser geolocation feeds into Google Places API (New) Nearby Search to fetch restaurants. Canvas-based spinning wheel with game-show animations. Local storage for user preferences.

**Tech Stack:** React 19, Vite, TypeScript, HTML5 Canvas, Google Places API (New), canvas-confetti

---

### Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: entire project scaffold via `npm create vite@latest`
- Modify: `package.json` (add dependencies)
- Create: `.env.example`
- Create: `.gitignore`

**Step 1: Create Vite project**

Run:
```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
npm create vite@latest . -- --template react-ts
```

If prompted about existing files, select "Ignore files and continue".

**Step 2: Install dependencies**

Run:
```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
npm install
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

**Step 3: Create `.env.example`**

Create `.env.example`:
```
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

**Step 4: Update `.gitignore`**

Ensure `.gitignore` includes:
```
.env
.env.local
```

**Step 5: Verify dev server starts**

Run:
```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
npm run dev
```

Expected: Vite dev server starts on localhost.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Project Structure & Type Definitions

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/constants.ts`
- Create: `src/hooks/` (directory)
- Create: `src/components/` (directory)

**Step 1: Create type definitions**

Create `src/types/index.ts`:
```typescript
export interface Restaurant {
  id: string;
  name: string;
  cuisineType: CuisineType;
  types: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  rating: number | null;
  priceLevel: string | null;
  isOpenNow: boolean | null;
  todayHours: string | null;
  distanceMiles: number;
}

export type CuisineType =
  | "pizza"
  | "mexican"
  | "chinese"
  | "indian"
  | "thai"
  | "japanese"
  | "american"
  | "italian"
  | "fast_food"
  | "seafood"
  | "mediterranean"
  | "korean"
  | "vietnamese"
  | "other";

export const CUISINE_LABELS: Record<CuisineType, string> = {
  pizza: "Pizza",
  mexican: "Mexican",
  chinese: "Chinese",
  indian: "Indian",
  thai: "Thai",
  japanese: "Japanese",
  american: "American",
  italian: "Italian",
  fast_food: "Fast Food",
  seafood: "Seafood",
  mediterranean: "Mediterranean",
  korean: "Korean",
  vietnamese: "Vietnamese",
  other: "Other",
};

export interface UserPreferences {
  excludedPlaceIds: string[];
  radius: number;
  enabledCuisines: CuisineType[];
  soundEnabled: boolean;
}

export interface WheelSlice {
  restaurant: Restaurant;
  color: string;
  startAngle: number;
  endAngle: number;
}
```

**Step 2: Create constants**

Create `src/utils/constants.ts`:
```typescript
import type { UserPreferences } from "../types";

export const DEFAULT_RADIUS_MILES = 5;
export const MIN_RADIUS_MILES = 1;
export const MAX_RADIUS_MILES = 10;
export const MAX_WHEEL_SLICES = 20;
export const MILES_TO_METERS = 1609.34;

export const WHEEL_COLORS = [
  "#FF6B6B", // red
  "#FFA94D", // orange
  "#FFD43B", // yellow
  "#69DB7C", // green
  "#4DABF7", // blue
  "#9775FA", // purple
  "#F06595", // pink
  "#38D9A9", // teal
  "#FF922B", // dark orange
  "#A9E34B", // lime
];

export const STORAGE_KEY = "wheelOfFood";

export const DEFAULT_PREFERENCES: UserPreferences = {
  excludedPlaceIds: [],
  radius: DEFAULT_RADIUS_MILES,
  enabledCuisines: [],
  soundEnabled: true,
};

// Google Places type -> our CuisineType mapping
export const PLACES_TYPE_TO_CUISINE: Record<string, string> = {
  pizza_restaurant: "pizza",
  mexican_restaurant: "mexican",
  chinese_restaurant: "chinese",
  indian_restaurant: "indian",
  thai_restaurant: "thai",
  japanese_restaurant: "japanese",
  american_restaurant: "american",
  italian_restaurant: "italian",
  fast_food_restaurant: "fast_food",
  seafood_restaurant: "seafood",
  mediterranean_restaurant: "mediterranean",
  korean_restaurant: "korean",
  vietnamese_restaurant: "vietnamese",
  hamburger_restaurant: "american",
  sushi_restaurant: "japanese",
  ramen_restaurant: "japanese",
  taco_shop: "mexican",
  barbecue_restaurant: "american",
};
```

**Step 3: Create directory structure**

Run:
```bash
mkdir -p src/hooks src/components
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add type definitions and constants"
```

---

### Task 3: Geolocation Hook

**Files:**
- Create: `src/hooks/useGeolocation.ts`

**Step 1: Implement the geolocation hook**

Create `src/hooks/useGeolocation.ts`:
```typescript
import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return state;
}
```

**Step 2: Commit**

```bash
git add src/hooks/useGeolocation.ts
git commit -m "feat: add geolocation hook"
```

---

### Task 4: Local Storage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`

**Step 1: Implement the local storage hook**

Create `src/hooks/useLocalStorage.ts`:
```typescript
import { useState, useCallback } from "react";
import type { UserPreferences } from "../types";
import { STORAGE_KEY, DEFAULT_PREFERENCES } from "../utils/constants";

export function useLocalStorage(): {
  preferences: UserPreferences;
  updatePreferences: (update: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
} {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreferences = useCallback(
    (update: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...update };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return { preferences, updatePreferences, clearPreferences };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useLocalStorage.ts
git commit -m "feat: add local storage hook for user preferences"
```

---

### Task 5: Google Places API Service

**Files:**
- Create: `src/services/placesApi.ts`

**Step 1: Implement the Places API service**

Create `src/services/placesApi.ts`:
```typescript
import type { Restaurant, CuisineType } from "../types";
import { PLACES_TYPE_TO_CUISINE, MILES_TO_METERS } from "../utils/constants";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const NEARBY_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchNearby";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.types",
  "places.location",
  "places.rating",
  "places.priceLevel",
  "places.currentOpeningHours",
  "places.businessStatus",
].join(",");

interface PlacesResponse {
  places?: Array<{
    id: string;
    displayName: { text: string };
    types: string[];
    location: { latitude: number; longitude: number };
    rating?: number;
    priceLevel?: string;
    currentOpeningHours?: { openNow: boolean; weekdayDescriptions?: string[] };
    businessStatus?: string;
  }>;
}

function classifyCuisine(types: string[]): CuisineType {
  for (const type of types) {
    if (PLACES_TYPE_TO_CUISINE[type]) {
      return PLACES_TYPE_TO_CUISINE[type] as CuisineType;
    }
  }
  return "other";
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTodayHours(
  weekdayDescriptions?: string[]
): string | null {
  if (!weekdayDescriptions?.length) return null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayEntry = weekdayDescriptions.find((d) =>
    d.startsWith(today)
  );
  return todayEntry ?? null;
}

export async function fetchNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusMiles: number
): Promise<Restaurant[]> {
  const response = await fetch(NEARBY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ["restaurant"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radiusMiles * MILES_TO_METERS,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data: PlacesResponse = await response.json();

  if (!data.places) return [];

  return data.places
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
    .map((place) => ({
      id: place.id,
      name: place.displayName.text,
      cuisineType: classifyCuisine(place.types),
      types: place.types,
      location: place.location,
      rating: place.rating ?? null,
      priceLevel: place.priceLevel ?? null,
      isOpenNow: place.currentOpeningHours?.openNow ?? null,
      todayHours: getTodayHours(
        place.currentOpeningHours?.weekdayDescriptions
      ),
      distanceMiles: Math.round(
        haversineDistance(
          latitude,
          longitude,
          place.location.latitude,
          place.location.longitude
        ) * 10
      ) / 10,
    }));
}
```

**Step 2: Commit**

```bash
git add src/services/placesApi.ts
git commit -m "feat: add Google Places API service with nearby search"
```

---

### Task 6: Restaurant Data Hook

**Files:**
- Create: `src/hooks/useRestaurants.ts`

**Step 1: Implement the restaurants hook**

Create `src/hooks/useRestaurants.ts`:
```typescript
import { useState, useCallback } from "react";
import type { Restaurant } from "../types";
import { fetchNearbyRestaurants } from "../services/placesApi";

interface UseRestaurantsReturn {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  fetchRestaurants: (
    lat: number,
    lng: number,
    radiusMiles: number
  ) => Promise<void>;
}

export function useRestaurants(): UseRestaurantsReturn {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantsCallback = useCallback(
    async (lat: number, lng: number, radiusMiles: number) => {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchNearbyRestaurants(lat, lng, radiusMiles);
        setRestaurants(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch restaurants"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants: fetchRestaurantsCallback,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useRestaurants.ts
git commit -m "feat: add useRestaurants hook"
```

---

### Task 7: Spinning Wheel Canvas Component

**Files:**
- Create: `src/components/SpinWheel.tsx`

**Step 1: Implement the canvas wheel**

Create `src/components/SpinWheel.tsx`:
```tsx
import { useRef, useEffect, useState, useCallback } from "react";
import type { Restaurant, WheelSlice } from "../types";
import { WHEEL_COLORS } from "../utils/constants";

interface SpinWheelProps {
  restaurants: Restaurant[];
  onResult: (restaurant: Restaurant) => void;
  spinning: boolean;
  onSpinEnd: () => void;
}

function buildSlices(restaurants: Restaurant[]): WheelSlice[] {
  const sliceAngle = (2 * Math.PI) / restaurants.length;
  return restaurants.map((restaurant, i) => ({
    restaurant,
    color: WHEEL_COLORS[i % WHEEL_COLORS.length],
    startAngle: i * sliceAngle,
    endAngle: (i + 1) * sliceAngle,
  }));
}

export function SpinWheel({
  restaurants,
  onResult,
  spinning,
  onSpinEnd,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>(0);
  const [slices, setSlices] = useState<WheelSlice[]>([]);

  useEffect(() => {
    setSlices(buildSlices(restaurants));
  }, [restaurants]);

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, size: number, rotation: number) => {
      const center = size / 2;
      const radius = center - 10;

      ctx.clearRect(0, 0, size, size);

      if (slices.length === 0) {
        ctx.fillStyle = "#2d2d2d";
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No restaurants", center, center);
        return;
      }

      slices.forEach((slice) => {
        const start = slice.startAngle + rotation;
        const end = slice.endAngle + rotation;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + (end - start) / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 3;
        const label =
          slice.restaurant.name.length > 18
            ? slice.restaurant.name.slice(0, 16) + "..."
            : slice.restaurant.name;
        ctx.fillText(label, radius - 15, 5);
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 22, 0, 2 * Math.PI);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = "#FFD43B";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pointer (top)
      ctx.beginPath();
      ctx.moveTo(center - 12, 2);
      ctx.lineTo(center + 12, 2);
      ctx.lineTo(center, 28);
      ctx.closePath();
      ctx.fillStyle = "#FFD43B";
      ctx.fill();
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [slices]
  );

  // Render static wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawWheel(ctx, canvas.width, rotationRef.current);
  }, [drawWheel]);

  // Spin animation
  useEffect(() => {
    if (!spinning || slices.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pick random winner
    const winnerIndex = Math.floor(Math.random() * slices.length);
    const sliceAngle = (2 * Math.PI) / slices.length;
    // Target: pointer at top (- PI/2) points to middle of winner slice
    const targetAngle =
      -(winnerIndex * sliceAngle + sliceAngle / 2) - Math.PI / 2;
    // Add extra full rotations for dramatic spin
    const extraSpins = (4 + Math.random() * 2) * 2 * Math.PI;
    const totalRotation = targetAngle + extraSpins - rotationRef.current;

    const duration = 3000 + Math.random() * 2000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      rotationRef.current = startRotation + totalRotation * eased;
      drawWheel(ctx!, canvas!.width, rotationRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onResult(slices[winnerIndex].restaurant);
        onSpinEnd();
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [spinning, slices, drawWheel, onResult, onSpinEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/components/SpinWheel.tsx
git commit -m "feat: add canvas-based spinning wheel component"
```

---

### Task 8: Result Card Component

**Files:**
- Create: `src/components/ResultCard.tsx`

**Step 1: Implement the result card**

Create `src/components/ResultCard.tsx`:
```tsx
import type { Restaurant } from "../types";
import { CUISINE_LABELS } from "../types";

interface ResultCardProps {
  restaurant: Restaurant;
  onSpinAgain: () => void;
  onExcludeAndSpin: () => void;
  onClose: () => void;
}

export function ResultCard({
  restaurant,
  onSpinAgain,
  onExcludeAndSpin,
  onClose,
}: ResultCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${restaurant.location.latitude},${restaurant.location.longitude}&query_place_id=${restaurant.id}`;

  const priceLabel = restaurant.priceLevel
    ? restaurant.priceLevel
        .replace("PRICE_LEVEL_", "")
        .replace("INEXPENSIVE", "$")
        .replace("MODERATE", "$$")
        .replace("EXPENSIVE", "$$$")
        .replace("VERY_EXPENSIVE", "$$$$")
    : null;

  return (
    <div className="result-card-overlay" onClick={onClose}>
      <div className="result-card" onClick={(e) => e.stopPropagation()}>
        <h2>{restaurant.name}</h2>
        <p className="result-cuisine">
          {CUISINE_LABELS[restaurant.cuisineType]}
        </p>

        <div className="result-details">
          {restaurant.rating && (
            <span className="result-rating">
              {"★".repeat(Math.round(restaurant.rating))} {restaurant.rating}
            </span>
          )}
          {priceLabel && <span className="result-price">{priceLabel}</span>}
          <span className="result-distance">
            {restaurant.distanceMiles} mi
          </span>
        </div>

        <div className="result-status">
          {restaurant.isOpenNow !== null && (
            <span
              className={restaurant.isOpenNow ? "status-open" : "status-closed"}
            >
              {restaurant.isOpenNow ? "Open Now" : "Closed"}
            </span>
          )}
          {restaurant.todayHours && (
            <span className="result-hours">{restaurant.todayHours}</span>
          )}
        </div>

        <div className="result-actions">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-directions"
          >
            Get Directions
          </a>
          <button className="btn btn-spin-again" onClick={onSpinAgain}>
            Spin Again
          </button>
          <button className="btn btn-exclude" onClick={onExcludeAndSpin}>
            Exclude & Spin Again
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ResultCard.tsx
git commit -m "feat: add result card component"
```

---

### Task 9: Filter Controls (Cuisine Chips, Radius Slider, Excluded Tags)

**Files:**
- Create: `src/components/FilterControls.tsx`

**Step 1: Implement the filter controls**

Create `src/components/FilterControls.tsx`:
```tsx
import type { CuisineType, UserPreferences } from "../types";
import { CUISINE_LABELS } from "../types";
import {
  MIN_RADIUS_MILES,
  MAX_RADIUS_MILES,
} from "../utils/constants";

interface FilterControlsProps {
  preferences: UserPreferences;
  availableCuisines: CuisineType[];
  excludedNames: { id: string; name: string }[];
  onRadiusChange: (radius: number) => void;
  onToggleCuisine: (cuisine: CuisineType) => void;
  onRemoveExclusion: (placeId: string) => void;
}

export function FilterControls({
  preferences,
  availableCuisines,
  excludedNames,
  onRadiusChange,
  onToggleCuisine,
  onRemoveExclusion,
}: FilterControlsProps) {
  return (
    <div className="filter-controls">
      {/* Radius Slider */}
      <div className="filter-section">
        <label className="filter-label">
          Radius: <strong>{preferences.radius} mi</strong>
        </label>
        <input
          type="range"
          min={MIN_RADIUS_MILES}
          max={MAX_RADIUS_MILES}
          step={0.5}
          value={preferences.radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="radius-slider"
        />
      </div>

      {/* Cuisine Chips */}
      <div className="filter-section">
        <label className="filter-label">Cuisines:</label>
        <div className="cuisine-chips">
          {availableCuisines.map((cuisine) => {
            const isEnabled =
              preferences.enabledCuisines.length === 0 ||
              preferences.enabledCuisines.includes(cuisine);
            return (
              <button
                key={cuisine}
                className={`chip ${isEnabled ? "chip-active" : "chip-inactive"}`}
                onClick={() => onToggleCuisine(cuisine)}
              >
                {CUISINE_LABELS[cuisine]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Excluded Tags */}
      {excludedNames.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">Excluded:</label>
          <div className="excluded-tags">
            {excludedNames.map(({ id, name }) => (
              <span key={id} className="excluded-tag">
                {name}
                <button
                  className="tag-remove"
                  onClick={() => onRemoveExclusion(id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/FilterControls.tsx
git commit -m "feat: add filter controls (cuisine chips, radius slider, excluded tags)"
```

---

### Task 10: Restaurant List Component

**Files:**
- Create: `src/components/RestaurantList.tsx`

**Step 1: Implement the restaurant list**

Create `src/components/RestaurantList.tsx`:
```tsx
import { useState } from "react";
import type { Restaurant } from "../types";
import { CUISINE_LABELS } from "../types";

interface RestaurantListProps {
  restaurants: Restaurant[];
  excludedIds: string[];
  onToggleExclude: (id: string) => void;
}

export function RestaurantList({
  restaurants,
  excludedIds,
  onToggleExclude,
}: RestaurantListProps) {
  const [expanded, setExpanded] = useState(false);
  const included = restaurants.filter((r) => !excludedIds.includes(r.id));

  return (
    <div className="restaurant-list">
      <button
        className="list-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        Restaurant List ({included.length})
        <span className={`arrow ${expanded ? "arrow-up" : "arrow-down"}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <ul className="restaurant-items">
          {restaurants.map((r) => {
            const isExcluded = excludedIds.includes(r.id);
            return (
              <li
                key={r.id}
                className={`restaurant-item ${isExcluded ? "excluded" : ""} ${r.isOpenNow === false ? "closed" : ""}`}
              >
                <label className="restaurant-label">
                  <input
                    type="checkbox"
                    checked={!isExcluded}
                    onChange={() => onToggleExclude(r.id)}
                  />
                  <span className="restaurant-name">{r.name}</span>
                  <span className="restaurant-meta">
                    {CUISINE_LABELS[r.cuisineType]} · {r.distanceMiles}mi
                  </span>
                  <span
                    className={`restaurant-status ${r.isOpenNow ? "open" : "closed"}`}
                  >
                    {r.isOpenNow === null
                      ? ""
                      : r.isOpenNow
                        ? "Open"
                        : "Closed"}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/RestaurantList.tsx
git commit -m "feat: add expandable restaurant list component"
```

---

### Task 11: Settings Panel Component

**Files:**
- Create: `src/components/SettingsPanel.tsx`

**Step 1: Implement the settings panel**

Create `src/components/SettingsPanel.tsx`:
```tsx
interface SettingsPanelProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearPreferences: () => void;
  onRefreshLocation: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  soundEnabled,
  onToggleSound,
  onClearPreferences,
  onRefreshLocation,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Settings</h3>

        <label className="setting-row">
          <span>Tick Sound</span>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={onToggleSound}
          />
        </label>

        <button className="btn btn-secondary" onClick={onRefreshLocation}>
          Re-detect Location
        </button>

        <button className="btn btn-danger" onClick={onClearPreferences}>
          Clear All Preferences
        </button>

        <button className="btn btn-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/SettingsPanel.tsx
git commit -m "feat: add settings panel component"
```

---

### Task 12: Main App Component — Wire Everything Together

**Files:**
- Modify: `src/App.tsx` (replace contents)

**Step 1: Implement the main App**

Replace `src/App.tsx` with:
```tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import { useGeolocation } from "./hooks/useGeolocation";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useRestaurants } from "./hooks/useRestaurants";
import { SpinWheel } from "./components/SpinWheel";
import { ResultCard } from "./components/ResultCard";
import { FilterControls } from "./components/FilterControls";
import { RestaurantList } from "./components/RestaurantList";
import { SettingsPanel } from "./components/SettingsPanel";
import type { Restaurant, CuisineType } from "./types";
import { MAX_WHEEL_SLICES } from "./utils/constants";
import "./App.css";

function App() {
  const geo = useGeolocation();
  const { preferences, updatePreferences, clearPreferences } =
    useLocalStorage();
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    fetchRestaurants,
  } = useRestaurants();

  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch restaurants when location is available or radius changes
  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      fetchRestaurants(geo.latitude, geo.longitude, preferences.radius);
    }
  }, [geo.latitude, geo.longitude, preferences.radius, fetchRestaurants]);

  // Derive available cuisines from fetched restaurants
  const availableCuisines = useMemo(() => {
    const cuisines = new Set<CuisineType>();
    restaurants.forEach((r) => cuisines.add(r.cuisineType));
    return Array.from(cuisines).sort();
  }, [restaurants]);

  // Filter restaurants for the wheel
  const wheelRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => !preferences.excludedPlaceIds.includes(r.id))
      .filter(
        (r) =>
          preferences.enabledCuisines.length === 0 ||
          preferences.enabledCuisines.includes(r.cuisineType)
      )
      .filter((r) => r.isOpenNow !== false) // exclude known-closed
      .slice(0, MAX_WHEEL_SLICES);
  }, [restaurants, preferences.excludedPlaceIds, preferences.enabledCuisines]);

  const excludedNames = useMemo(
    () =>
      restaurants
        .filter((r) => preferences.excludedPlaceIds.includes(r.id))
        .map((r) => ({ id: r.id, name: r.name })),
    [restaurants, preferences.excludedPlaceIds]
  );

  const handleSpin = useCallback(() => {
    if (wheelRestaurants.length === 0 || spinning) return;
    setWinner(null);
    setSpinning(true);
  }, [wheelRestaurants.length, spinning]);

  const handleResult = useCallback((restaurant: Restaurant) => {
    setWinner(restaurant);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, []);

  const handleSpinEnd = useCallback(() => {
    setSpinning(false);
  }, []);

  const handleSpinAgain = useCallback(() => {
    setWinner(null);
    setTimeout(() => {
      setSpinning(true);
    }, 100);
  }, []);

  const handleExcludeAndSpin = useCallback(() => {
    if (!winner) return;
    updatePreferences({
      excludedPlaceIds: [...preferences.excludedPlaceIds, winner.id],
    });
    setWinner(null);
    setTimeout(() => {
      setSpinning(true);
    }, 200);
  }, [winner, preferences.excludedPlaceIds, updatePreferences]);

  const handleToggleCuisine = useCallback(
    (cuisine: CuisineType) => {
      const current = preferences.enabledCuisines;
      const updated = current.includes(cuisine)
        ? current.filter((c) => c !== cuisine)
        : [...current, cuisine];
      updatePreferences({ enabledCuisines: updated });
    },
    [preferences.enabledCuisines, updatePreferences]
  );

  const handleToggleExclude = useCallback(
    (placeId: string) => {
      const current = preferences.excludedPlaceIds;
      const updated = current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId];
      updatePreferences({ excludedPlaceIds: updated });
    },
    [preferences.excludedPlaceIds, updatePreferences]
  );

  const handleRefresh = useCallback(() => {
    if (geo.latitude && geo.longitude) {
      fetchRestaurants(geo.latitude, geo.longitude, preferences.radius);
    }
  }, [geo.latitude, geo.longitude, preferences.radius, fetchRestaurants]);

  // Loading / error states
  if (geo.loading) {
    return (
      <div className="app loading-screen">
        <h1>Wheel of Food</h1>
        <p>Detecting your location...</p>
      </div>
    );
  }

  if (geo.error) {
    return (
      <div className="app error-screen">
        <h1>Wheel of Food</h1>
        <p>Could not get your location: {geo.error}</p>
        <p>Please enable location access and reload.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Wheel of Food</h1>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
        >
          ⚙
        </button>
      </header>

      <main className="app-main">
        <div className="wheel-section">
          <SpinWheel
            restaurants={wheelRestaurants}
            onResult={handleResult}
            spinning={spinning}
            onSpinEnd={handleSpinEnd}
          />

          <button
            className={`spin-button ${spinning ? "spinning" : ""}`}
            onClick={handleSpin}
            disabled={spinning || wheelRestaurants.length === 0}
          >
            {spinning
              ? "Spinning..."
              : wheelRestaurants.length === 0
                ? "No restaurants"
                : "SPIN!"}
          </button>

          {wheelRestaurants.length > MAX_WHEEL_SLICES && (
            <p className="wheel-cap-warning">
              Showing first {MAX_WHEEL_SLICES} restaurants. Use filters
              to narrow down.
            </p>
          )}
        </div>

        {restaurantsLoading && <p className="loading-text">Loading restaurants...</p>}
        {restaurantsError && (
          <p className="error-text">Error: {restaurantsError}</p>
        )}

        <FilterControls
          preferences={preferences}
          availableCuisines={availableCuisines}
          excludedNames={excludedNames}
          onRadiusChange={(radius) => updatePreferences({ radius })}
          onToggleCuisine={handleToggleCuisine}
          onRemoveExclusion={(id) => handleToggleExclude(id)}
        />

        <button className="btn btn-refresh" onClick={handleRefresh}>
          Refresh Restaurants
        </button>

        <RestaurantList
          restaurants={restaurants}
          excludedIds={preferences.excludedPlaceIds}
          onToggleExclude={handleToggleExclude}
        />
      </main>

      {winner && (
        <ResultCard
          restaurant={winner}
          onSpinAgain={handleSpinAgain}
          onExcludeAndSpin={handleExcludeAndSpin}
          onClose={() => setWinner(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          soundEnabled={preferences.soundEnabled}
          onToggleSound={() =>
            updatePreferences({ soundEnabled: !preferences.soundEnabled })
          }
          onClearPreferences={clearPreferences}
          onRefreshLocation={() => window.location.reload()}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App with all components, hooks, and state"
```

---

### Task 13: Game-Show CSS Styling

**Files:**
- Modify: `src/App.css` (replace contents)
- Modify: `src/index.css` (replace contents)

**Step 1: Write global styles**

Replace `src/index.css` with global reset and base styles:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #f0f0f0;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
```

**Step 2: Write App.css with game-show styles**

Replace `src/App.css` — this is a large file covering all components. Key sections:

```css
/* App Layout */
.app {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}

.loading-screen,
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.app-header h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(90deg, #FFD43B, #FF6B6B, #9775FA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}
.settings-btn:hover { color: #FFD43B; }

/* Wheel Section */
.wheel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px 0;
}

/* Spin Button */
.spin-button {
  margin-top: 16px;
  padding: 16px 48px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 2px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #FF6B6B, #FF922B);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  animation: pulse 2s infinite;
}

.spin-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(255, 107, 107, 0.6);
}

.spin-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  animation: none;
}

.spin-button.spinning {
  animation: none;
  opacity: 0.7;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

/* Filter Controls */
.filter-controls {
  margin: 16px 0;
}

.filter-section {
  margin-bottom: 12px;
}

.filter-label {
  display: block;
  font-size: 14px;
  color: #aaa;
  margin-bottom: 6px;
}

.radius-slider {
  width: 100%;
  accent-color: #FFD43B;
}

/* Cuisine Chips */
.cuisine-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 2px solid;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-active {
  background: #FFD43B;
  border-color: #FFD43B;
  color: #1a1a2e;
}

.chip-inactive {
  background: transparent;
  border-color: #555;
  color: #888;
}

.chip-inactive:hover {
  border-color: #FFD43B;
  color: #FFD43B;
}

/* Excluded Tags */
.excluded-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.excluded-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid #FF6B6B;
  border-radius: 14px;
  font-size: 12px;
  color: #FF6B6B;
}

.tag-remove {
  background: none;
  border: none;
  color: #FF6B6B;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
}

/* Restaurant List */
.restaurant-list {
  margin-top: 16px;
}

.list-toggle {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f0f0f0;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow { transition: transform 0.2s; }
.arrow-up { transform: rotate(180deg); }

.restaurant-items {
  list-style: none;
  margin-top: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.restaurant-item {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.restaurant-item.excluded { opacity: 0.4; }
.restaurant-item.closed { opacity: 0.6; }

.restaurant-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.restaurant-name {
  flex: 1;
  font-weight: 600;
}

.restaurant-meta {
  color: #888;
  font-size: 12px;
}

.restaurant-status {
  font-size: 11px;
  font-weight: 700;
}
.restaurant-status.open { color: #69DB7C; }
.restaurant-status.closed { color: #FF6B6B; }

/* Result Card Overlay */
.result-card-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s;
}

.result-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid #FFD43B;
  border-radius: 16px;
  padding: 28px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.4s ease-out;
}

.result-card h2 {
  font-size: 24px;
  color: #FFD43B;
  margin-bottom: 4px;
}

.result-cuisine {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 12px;
}

.result-details {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 15px;
}

.result-rating { color: #FFD43B; }
.result-price { color: #69DB7C; }
.result-distance { color: #4DABF7; }

.result-status {
  margin-bottom: 16px;
}

.status-open {
  color: #69DB7C;
  font-weight: 700;
}
.status-closed {
  color: #FF6B6B;
  font-weight: 700;
}

.result-hours {
  display: block;
  color: #888;
  font-size: 13px;
  margin-top: 4px;
}

/* Buttons */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: transform 0.1s;
}
.btn:hover { transform: scale(1.02); }

.btn-directions {
  background: #4DABF7;
  color: #fff;
}

.btn-spin-again {
  background: linear-gradient(135deg, #FF6B6B, #FF922B);
  color: #fff;
}

.btn-exclude {
  background: transparent;
  border: 1px solid #FF6B6B;
  color: #FF6B6B;
}

.btn-refresh {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
}
.btn-refresh:hover { background: rgba(255, 255, 255, 0.12); }

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  width: 100%;
}

.btn-danger {
  background: rgba(255, 107, 107, 0.2);
  color: #FF6B6B;
  width: 100%;
}

.btn-close {
  background: transparent;
  color: #888;
  width: 100%;
}

/* Settings Panel */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-panel {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-panel h3 {
  text-align: center;
  color: #FFD43B;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

/* Utility */
.loading-text {
  text-align: center;
  color: #888;
  padding: 8px;
}

.error-text {
  text-align: center;
  color: #FF6B6B;
  padding: 8px;
}

.wheel-cap-warning {
  text-align: center;
  color: #FFA94D;
  font-size: 13px;
  margin-top: 8px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Step 3: Clean up default Vite files**

Delete these default files that we don't need:
- `src/App.css` (we're replacing it)
- `src/assets/react.svg`
- `public/vite.svg`

**Step 4: Update `src/main.tsx`**

Ensure `src/main.tsx` imports `index.css`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 5: Update `index.html` title**

In `index.html`, change `<title>Vite + React + TS</title>` to `<title>Wheel of Food</title>`.

**Step 6: Verify dev server runs without errors**

Run:
```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
npm run dev
```

Expected: App compiles, dev server starts. (The API calls won't work yet without a key, but the UI should render.)

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add game-show CSS styling and clean up defaults"
```

---

### Task 14: Final Build Verification & Push

**Step 1: Run the TypeScript compiler check**

Run:
```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Run the production build**

Run:
```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
npm run build
```

Expected: Build succeeds, output in `dist/`.

**Step 3: Push to GitHub**

```bash
cd /Users/aathaval/Documents/coding_dir/wheel-of-food
git push origin main
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Scaffold Vite + React + TS project |
| 2 | Type definitions & constants |
| 3 | Geolocation hook |
| 4 | Local storage hook |
| 5 | Google Places API service |
| 6 | Restaurant data hook |
| 7 | Spinning wheel canvas component |
| 8 | Result card component |
| 9 | Filter controls (cuisines, radius, excludes) |
| 10 | Restaurant list component |
| 11 | Settings panel component |
| 12 | Main App — wire everything together |
| 13 | Game-show CSS styling |
| 14 | Final build verification & push |
