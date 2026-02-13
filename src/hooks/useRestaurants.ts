import { useState, useCallback } from "react";
import type { Restaurant } from "../types";
import { fetchNearbyRestaurants } from "../services/placesApi";

interface UseRestaurantsReturn {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  fetchRestaurants: (lat: number, lng: number, radiusMiles: number) => Promise<void>;
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
        setError(err instanceof Error ? err.message : "Failed to fetch restaurants");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { restaurants, loading, error, fetchRestaurants: fetchRestaurantsCallback };
}
