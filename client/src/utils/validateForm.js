export function validateRequired(values, fields) {
  return fields.reduce((errors, field) => {
    if (!String(values[field] ?? "").trim()) {
      errors[field] = "This field is required";
    }

    return errors;
  }, {});
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}
