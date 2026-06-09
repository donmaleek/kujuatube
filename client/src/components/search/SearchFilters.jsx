import { VIDEO_CATEGORIES } from "../../utils/constants.js";

export default function SearchFilters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <section className="filter-row">
      <select value={filters.category || ""} onChange={(event) => update("category", event.target.value)}>
        <option value="">All categories</option>
        {VIDEO_CATEGORIES.map((category) => (
          <option value={category} key={category}>
            {category}
          </option>
        ))}
      </select>
      <select value={filters.sort || "relevance"} onChange={(event) => update("sort", event.target.value)}>
        <option value="relevance">Relevance</option>
        <option value="newest">Newest</option>
        <option value="views">Most viewed</option>
      </select>
    </section>
  );
}
