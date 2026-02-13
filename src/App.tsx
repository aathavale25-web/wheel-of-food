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
      .filter((r) => r.isOpenNow !== false)
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
