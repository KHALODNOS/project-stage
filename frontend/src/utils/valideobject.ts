export const validateObjectId = (id: string | undefined) => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};
