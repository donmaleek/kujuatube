export default function Avatar({ src, name, className = "" }) {
  const initial = (name || "?")[0].toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name || ""}
        className={`avatar ${className}`.trim()}
        onError={(e) => {
          // Image URL broken — swap to an initials span in-place
          const span = document.createElement("span");
          span.className = e.currentTarget.className;
          span.textContent = initial;
          e.currentTarget.replaceWith(span);
        }}
      />
    );
  }
  return <span className={`avatar ${className}`.trim()}>{initial}</span>;
}
