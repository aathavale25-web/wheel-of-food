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
