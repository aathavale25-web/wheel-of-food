# Wheel of Food — Design Document

## Overview

A React web app that helps you pick a takeout dinner option by spinning a randomized wheel of nearby restaurants. The app discovers restaurants within an adjustable radius using the Google Places API, lets you filter by cuisine and exclude specific places, and presents the selection through a fun, game-show-style spinning wheel with confetti and celebratory animations.

## Tech Stack

- **React** (Vite) — fast dev experience, simple setup
- **HTML5 Canvas** — spinning wheel rendering and animation
- **Google Places API (New)** — restaurant discovery, hours, open/closed status
- **Local Storage** — persisted preferences (excluded restaurants, radius, filters)
- **No backend** — API calls go directly from the client (API key restricted by domain)

## Core Flow

1. App loads and requests browser geolocation
2. Fetches nearby restaurants from Google Places within the user's chosen radius
3. User filters by cuisine category, optionally excludes specific places
4. Remaining restaurants populate the wheel
5. User spins — wheel animates with deceleration — lands on a winner
6. Confetti + result card with restaurant name, rating, distance, hours, and a "Get Directions" link

## UI Layout

### Single Page Layout

```
+-----------------------------+
|  Wheel of Food       [gear] |  <- Header + settings
+-----------------------------+
|                             |
|     +---------------+       |
|     |               |       |
|     |  SPIN WHEEL   |       |
|     |   (Canvas)    |       |
|     |               |       |
|     +---------------+       |
|                             |
|      [ SPIN! button ]      |
|                             |
+-----------------------------+
| Radius: o========o  5 mi   |  <- Slider
|                             |
| Cuisines: [Pizza] [Mexican] |  <- Toggle chips
| [Chinese] [Indian] [+more]  |
|                             |
| Excluded: Olive Garden x    |  <- Removable tags
|           Applebees x       |
+-----------------------------+
| Restaurant List (12)        |  <- Expandable list
|  [x] Chipotle    0.8mi Open|
|  [x] Panda Exp   1.2mi Open|
|  [ ] Olive Grdn  2.1mi Closed|
+-----------------------------+
```

### Key Interactions

- **Spin button** is big, central, and animated (pulses to invite clicks)
- **Cuisine chips** toggle on/off — wheel updates instantly as you filter
- **Restaurant list** at the bottom lets you uncheck individual places — unchecked ones move to the "Excluded" tags and get saved to local storage
- **Settings gear** opens a panel for clearing preferences and re-requesting location
- **Winner reveal** — wheel stops, zooms into the winning slice, confetti bursts, and a result card slides up with details + "Open in Google Maps" button

## Canvas Wheel & Animation

### Rendering

- Each included restaurant gets an equal-sized slice
- Slices alternate between bold, playful colors (reds, oranges, yellows, greens, blues, purples)
- Restaurant name displayed along each slice (truncated if long, with cuisine icon)
- A fixed pointer/arrow at the top of the wheel indicates the winner
- Cap the wheel at 20 restaurants — prompt user to filter more if exceeded

### Spin Animation

- Click "SPIN!" — wheel accelerates quickly, then decelerates with an easing curve (cubic bezier)
- Spin duration: 3-5 seconds (randomized slightly each time)
- Final landing position is pre-calculated randomly, then the animation curves to land there
- Subtle tick sound as the pointer passes each slice boundary (toggleable)
- Final stop — short pause — winning slice highlights/glows — confetti explosion — result card slides up

### Result Card

- Restaurant name + cuisine type
- Star rating + price level
- Distance from user
- Open/closed status with today's hours
- "Get Directions" button (opens Google Maps)
- "Spin Again" and "Exclude & Spin Again" buttons

## Google Places API Integration

### Setup

- Use the Places API (New) — Nearby Search endpoint
- API key restricted to deployment domain
- Key stored as environment variable (`VITE_GOOGLE_PLACES_API_KEY`)

### Fetching Restaurants

- On app load and radius change, call Nearby Search with:
  - User's lat/lng from browser geolocation
  - Radius from the slider (converted to meters)
  - Type filter: `restaurant`
- Paginate with `nextPageToken` up to 60 results max
- Extract: name, place ID, location, rating, price level, types/categories, opening hours, business status

### Cuisine Categorization

- Map Google Places `types` to user-friendly labels:
  - Pizza, Mexican, Chinese, Indian, Thai, Japanese, American, Italian, Fast Food, etc.
  - Restaurants with no specific cuisine type labeled "Other"

### Open/Closed Handling

- Use `currentOpeningHours` field for real-time status
- Closed restaurants shown dimmed in the list with "Closed" badge
- Closed restaurants excluded from the wheel by default (toggle to include)

### Data Refresh

- Results cached in memory for the session
- Re-fetched only on user-initiated "Refresh" button or radius change
- No automatic polling
- Stale exclusions (restaurant no longer in results) cleaned up automatically

## Local Storage Schema

```json
{
  "wheelOfFood": {
    "excludedPlaceIds": ["ChIJ...abc", "ChIJ...def"],
    "radius": 5,
    "enabledCuisines": ["pizza", "mexican", "chinese"],
    "soundEnabled": true
  }
}
```

## Design & Style

- **Playful / game-show vibe** — bold colors, fun animations, confetti on selection
- Big, inviting spin button with pulse animation
- Celebratory winner reveal with confetti burst
- Warm, energetic color palette
- Mobile-responsive (wheel scales to viewport)
