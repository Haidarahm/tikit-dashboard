import { apiClient } from "./client.js";

/**
 * Call backend /translate endpoint with given text.
 * Expected response shape:
 * {
 *   success: true,
 *   data: {
 *     en: string,
 *     ar: string,
 *     fr: string
 *   }
 * }
 *
 * @param {string} text
 * @returns {Promise<{ en: string; ar: string; fr: string }>}
 */
export async function translate(text) {
  const payload = { text };
  const response = await apiClient.post("/translate", payload);

  // Normalize response to always return the inner data object
  if (response?.data?.data) {
    return response.data.data;
  }

  // Fallback if backend returns data directly
  return response.data;
}

