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
