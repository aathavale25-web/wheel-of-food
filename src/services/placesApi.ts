import type { Restaurant, CuisineType } from "../types";
import { PLACES_TYPE_TO_CUISINE, MILES_TO_METERS } from "../utils/constants";

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby";

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
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTodayHours(weekdayDescriptions?: string[]): string | null {
  if (!weekdayDescriptions?.length) return null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayEntry = weekdayDescriptions.find((d) => d.startsWith(today));
  return todayEntry ?? null;
}

export async function fetchNearbyRestaurants(
  latitude: number, longitude: number, radiusMiles: number
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
      todayHours: getTodayHours(place.currentOpeningHours?.weekdayDescriptions),
      distanceMiles: Math.round(
        haversineDistance(latitude, longitude, place.location.latitude, place.location.longitude) * 10
      ) / 10,
    }));
}
