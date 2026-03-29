import { getStats } from "../utils/visitor-counter";

export default defineEventHandler(() => {
  return getStats();
});
