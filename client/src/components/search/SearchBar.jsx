import { useState } from "react";

export default function SearchBar({ compact = false, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event) {
    event.preventDefault();
    const value = query.trim();
    window.location.href = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
  }

  return (
    <form className={compact ? "search-bar compact" : "search-bar"} onSubmit={onSubmit} role="search">
      <input
        aria-label="Search videos"
        placeholder="Search videos"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button className="button primary">Search</button>
    </form>
  );
}
