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
      <button className="list-toggle" onClick={() => setExpanded(!expanded)}>
        Restaurant List ({included.length})
        <span className={`arrow ${expanded ? "arrow-up" : "arrow-down"}`}>▼</span>
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
                  <span className={`restaurant-status ${r.isOpenNow ? "open" : "closed"}`}>
                    {r.isOpenNow === null ? "" : r.isOpenNow ? "Open" : "Closed"}
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
