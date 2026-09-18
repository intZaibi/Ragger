export const EMBEDDING_MODEL = "text-embedding-3-large";
export const VECTOR_SIZE = 3072;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_LENGTH = 200000;
export function ownsCollection(userId, collectionName) {
  return typeof userId === "string" && Boolean(userId) && typeof collectionName === "string" && collectionName.startsWith(userId + "--") && collectionName.length > userId.length + 2;
}
export function notebookName(collectionName, userId) {
  return collectionName.slice(userId.length + 2).replace(/-[a-f0-9]{8}$/, "").replace(/-/g, " ");
}
export function validateName(value) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 80) throw new Error("Use a notebook name between 1 and 80 characters.");
  return value.trim();
}
export function makeCollectionName(userId, name, suffix) {
  const slug = validateName(name).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "notebook";
  return userId + "--" + slug + "-" + suffix;
}
