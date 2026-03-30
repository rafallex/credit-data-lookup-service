const { getCreditData } = require("../src/creditDataService");
const db = require("../src/db");
const creditDataClient = require("../src/creditDataClient");

// Mock dependencies
jest.mock("../src/db");
jest.mock("../src/creditDataClient");

const SAMPLE_SSN = "424-11-9327";

const SAMPLE_DATA = {
  first_name: "Emma",
  last_name: "Gautrey",
  address: "09 Westend Terrace",
  assessed_income: 60668,
  balance_of_debt: 11585,
  complaints: true,
};

describe("creditDataService", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getCreditData", () => {
    it("returns cached data without calling the remote API", async () => {
      db.getCachedCreditData.mockReturnValue(SAMPLE_DATA);

      const result = await getCreditData(SAMPLE_SSN);

      expect(result).toEqual(SAMPLE_DATA);
      expect(db.getCachedCreditData).toHaveBeenCalledWith(SAMPLE_SSN);
      expect(creditDataClient.fetchAllCreditData).not.toHaveBeenCalled();
      expect(db.cacheCreditData).not.toHaveBeenCalled();
    });

    it("fetches from remote API on cache miss and stores result", async () => {
      db.getCachedCreditData.mockReturnValue(null);
      creditDataClient.fetchAllCreditData.mockResolvedValue(SAMPLE_DATA);

      const result = await getCreditData(SAMPLE_SSN);

      expect(result).toEqual(SAMPLE_DATA);
      expect(creditDataClient.fetchAllCreditData).toHaveBeenCalledWith(SAMPLE_SSN);
      expect(db.cacheCreditData).toHaveBeenCalledWith(SAMPLE_SSN, SAMPLE_DATA);
    });

    it("propagates errors from the remote API", async () => {
      db.getCachedCreditData.mockReturnValue(null);
      const error = new Error("Not Found");
      error.response = { status: 404 };
      creditDataClient.fetchAllCreditData.mockRejectedValue(error);

      await expect(getCreditData(SAMPLE_SSN)).rejects.toThrow("Not Found");
      expect(db.cacheCreditData).not.toHaveBeenCalled();
    });

    it("does not cache data when remote API fails", async () => {
      db.getCachedCreditData.mockReturnValue(null);
      creditDataClient.fetchAllCreditData.mockRejectedValue(new Error("timeout"));

      await expect(getCreditData(SAMPLE_SSN)).rejects.toThrow("timeout");
      expect(db.cacheCreditData).not.toHaveBeenCalled();
    });
  });
});
