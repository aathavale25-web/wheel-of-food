import type { UserPreferences } from "../types";

export const DEFAULT_RADIUS_MILES = 5;
export const MIN_RADIUS_MILES = 1;
export const MAX_RADIUS_MILES = 10;
export const MAX_WHEEL_SLICES = 20;
export const MILES_TO_METERS = 1609.34;

export const WHEEL_COLORS = [
  "#FF6B6B", "#FFA94D", "#FFD43B", "#69DB7C", "#4DABF7",
  "#9775FA", "#F06595", "#38D9A9", "#FF922B", "#A9E34B",
];

export const STORAGE_KEY = "wheelOfFood";

export const DEFAULT_PREFERENCES: UserPreferences = {
  excludedPlaceIds: [],
  radius: DEFAULT_RADIUS_MILES,
  enabledCuisines: [],
  soundEnabled: true,
};

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
