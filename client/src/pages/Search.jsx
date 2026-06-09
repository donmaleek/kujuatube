import { useState } from "react";
import SearchBar from "../components/search/SearchBar.jsx";
import SearchFilters from "../components/search/SearchFilters.jsx";
import SearchResults from "../components/search/SearchResults.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useVideos } from "../hooks/useVideo.js";

export default function Search() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const [filters, setFilters] = useState({ sort: "relevance", category: params.get("category") || "" });
  const { videos, loading, error } = useVideos({ q: query, ...filters });

  return (
    <>
      <section className="page-heading">
        <h1>Search</h1>
        <SearchBar initialQuery={query} />
      </section>
      <SearchFilters filters={filters} onChange={setFilters} />
      {loading ? <LoadingSpinner label="Searching" /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <SearchResults videos={videos} />
    </>
  );
}
