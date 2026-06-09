import { VIDEO_CATEGORIES } from "../../utils/constants.js";

const visibilityOptions = [
  { value: "public", title: "Public", detail: "Everyone can watch" },
  { value: "unlisted", title: "Unlisted", detail: "Only people with the link" },
  { value: "private", title: "Private", detail: "Only you can watch" }
];

export default function VideoDetailsForm({ values, onChange }) {
  function update(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <section className="studio-details-panel">
      <header className="studio-section-heading">
        <h2>Details</h2>
        <span>{values.title.length}/100</span>
      </header>
      <div className="studio-form-grid">
      <label className="studio-field full">
        Title
        <input maxLength="100" value={values.title} onChange={(event) => update("title", event.target.value)} required />
      </label>
      <label className="studio-field full">
        Description
        <textarea rows="6" value={values.description} onChange={(event) => update("description", event.target.value)} />
      </label>
      <label className="studio-field">
        Category
        <select value={values.category} onChange={(event) => update("category", event.target.value)}>
          {VIDEO_CATEGORIES.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="studio-field">
        Duration
        <input
          value={values.duration}
          onChange={(event) => update("duration", event.target.value)}
          placeholder="Detected automatically"
        />
      </label>
      </div>
      <div className="studio-visibility-grid">
        {visibilityOptions.map((option) => (
          <label className={values.visibility === option.value ? "studio-visibility-card selected" : "studio-visibility-card"} key={option.value}>
            <input
              checked={values.visibility === option.value}
              name="visibility"
              onChange={() => update("visibility", option.value)}
              type="radio"
              value={option.value}
            />
            <span>
              <strong>{option.title}</strong>
              <small>{option.detail}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
