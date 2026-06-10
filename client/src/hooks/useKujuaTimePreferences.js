import { useCallback, useState } from "react";

export const defaultKujuaTimePreferences = {
  intent: "learn",
  localFirst: 72,
  newCreators: 58,
  calmMode: true,
  trustMode: true,
  sessionMinutes: 24
};

function readPreferences() {
  if (typeof window === "undefined") return defaultKujuaTimePreferences;

  try {
    const saved = window.localStorage.getItem("kujuatime.preferences");
    return saved ? { ...defaultKujuaTimePreferences, ...JSON.parse(saved) } : defaultKujuaTimePreferences;
  } catch (_error) {
    return defaultKujuaTimePreferences;
  }
}

export function useKujuaTimePreferences() {
  const [preferences, setPreferences] = useState(readPreferences);

  const savePreferences = useCallback((nextPreferences) => {
    setPreferences(nextPreferences);
    window.localStorage.setItem("kujuatime.preferences", JSON.stringify(nextPreferences));
  }, []);

  const updatePreference = useCallback(
    (key, value) => {
      savePreferences({ ...preferences, [key]: value });
    },
    [preferences, savePreferences]
  );

  const resetPreferences = useCallback(() => {
    savePreferences(defaultKujuaTimePreferences);
  }, [savePreferences]);

  return { preferences, updatePreference, resetPreferences };
}
