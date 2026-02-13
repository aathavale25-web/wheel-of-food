import type { CuisineType, UserPreferences } from "../types";
import { CUISINE_LABELS } from "../types";
import { MIN_RADIUS_MILES, MAX_RADIUS_MILES } from "../utils/constants";

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

      {excludedNames.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">Excluded:</label>
          <div className="excluded-tags">
            {excludedNames.map(({ id, name }) => (
              <span key={id} className="excluded-tag">
                {name}
                <button className="tag-remove" onClick={() => onRemoveExclusion(id)}>
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
