// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
