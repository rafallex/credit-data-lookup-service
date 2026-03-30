const { getCachedCreditData, cacheCreditData } = require("./db");
const { fetchAllCreditData } = require("./creditDataClient");

/**
 * Returns aggregated credit data for the given SSN.
 * Checks the SQLite cache first; on miss, fetches from the remote API
 * and stores the result before returning.
 * Throws if the SSN is not found upstream (404) or on any other API error.
 *
 * @param {string} ssn
 * @returns {Promise<object>} aggregated credit data
 */
async function getCreditData(ssn) {
  const cached = getCachedCreditData(ssn);
  if (cached) return cached;

  const data = await fetchAllCreditData(ssn);
  cacheCreditData(ssn, data);

  return data;
}

module.exports = { getCreditData };
