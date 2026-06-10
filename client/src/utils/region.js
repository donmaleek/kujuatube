const timezoneRegions = {
  "Africa/Nairobi": "KE"
};

export function getViewerRegion() {
  const savedRegion = localStorage.getItem("kujuatime.region");
  if (savedRegion) return savedRegion;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezoneRegions[timezone]) return timezoneRegions[timezone];

  return "KE";
}
