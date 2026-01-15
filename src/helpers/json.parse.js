export const jsonParse = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
