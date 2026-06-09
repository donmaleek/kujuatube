const TABS = [
  { id: "videos", label: "Videos" },
  { id: "playlists", label: "Playlists" },
  { id: "about", label: "About" }
];

export default function ChannelTabs({ activeTab, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          className={activeTab === tab.id ? "active" : ""}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
