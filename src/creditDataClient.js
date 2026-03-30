const axios = require("axios");

const BASE_URL =
  process.env.CREDIT_API_URL || "https://coding-test-api.alvalabs.io";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

async function fetchPersonalDetails(ssn) {
  const { data } = await client.get(
    `/api/credit-data/personal-details/${encodeURIComponent(ssn)}`
  );
  return data;
}

async function fetchDebt(ssn) {
  const { data } = await client.get(
    `/api/credit-data/debt/${encodeURIComponent(ssn)}`
  );
  return data;
}

async function fetchAssessedIncome(ssn) {
  const { data } = await client.get(
    `/api/credit-data/assessed-income/${encodeURIComponent(ssn)}`
  );
  return data;
}

/**
 * Fetches all three credit data endpoints in parallel and merges
 * into the aggregated shape the Lookup Service API requires.
 */
async function fetchAllCreditData(ssn) {
  const [personal, debt, income] = await Promise.all([
    fetchPersonalDetails(ssn),
    fetchDebt(ssn),
    fetchAssessedIncome(ssn),
  ]);

  return {
    first_name: personal.first_name,
    last_name: personal.last_name,
    address: personal.address,
    assessed_income: income.assessed_income,
    balance_of_debt: debt.balance_of_debt,
    complaints: debt.complaints,
  };
}

module.exports = {
  fetchPersonalDetails,
  fetchDebt,
  fetchAssessedIncome,
  fetchAllCreditData,
};
