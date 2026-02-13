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
