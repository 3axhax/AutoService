export const parseJSONSafely = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};
