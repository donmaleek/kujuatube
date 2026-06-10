export function createCategoryModel({ id, name, description = "" }) {
  return {
    id,
    name,
    description,
    createdAt: new Date().toISOString()
  };
}
