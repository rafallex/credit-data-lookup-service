// IMPORTANT: Please do not change this file as it is used to calculate the coding test score.

const apiUrl = `${Cypress.env("apiUrl")}`

describe('Lookup Service - Level 1', () => {

  it('Provides a functional healthcheck', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${apiUrl}/ping`,
    }).then((response) => {
      assert.equal(response.status, 200, "Ping should return 200 status code")
    })
  })

  it('Can correctly aggregate and return Emma\'s credit data', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${apiUrl}/credit-data/424-11-9327`,
    }).then((response) => {
      assert.equal(response.status, 200, "Getting aggregated credit data for ssn 424-11-9327 should return 200 status code")
      assert.equal(response.body.first_name, "Emma", "Data mismatch when returning aggregated credit data for ssn 424-11-9327")
      assert.equal(response.body.last_name, "Gautrey", "Data mismatch when returning aggregated credit data for ssn 424-11-9327")
      expect(response.body.address).to.match(/\d{1,4} Westend Terrace$/)
      assert.equal(response.body.assessed_income, 60668, "Data mismatch when returning aggregated credit data for ssn 424-11-9327")
      assert.equal(response.body.balance_of_debt, 11585, "Data mismatch when returning aggregated credit data for ssn 424-11-9327")
      assert.equal(response.body.complaints, true, "Data mismatch when returning aggregated credit data for ssn 424-11-9327")
    })
  })

  it('Can correctly aggregate and return Billy\'s credit data', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${apiUrl}/credit-data/553-25-8346`,
    }).then((response) => {
      assert.equal(response.status, 200, "Getting aggregated credit data for ssn 424-11-9327 should return 200 status code")
      assert.equal(response.body.first_name, "Billy", "Data mismatch when returning aggregated credit data for ssn 553-25-8346")
      assert.equal(response.body.last_name, "Brinegar", "Data mismatch when returning aggregated credit data for ssn 553-25-8346")
      expect(response.body.address).to.match(/\d{1,4} Providence Lane La Puente, CA 91744$/)
      assert.equal(response.body.assessed_income, 89437, "Data mismatch when returning aggregated credit data for ssn 553-25-8346")
      assert.equal(response.body.balance_of_debt, 178, "Data mismatch when returning aggregated credit data for ssn 553-25-8346")
      assert.equal(response.body.complaints, false, "Data mismatch when returning aggregated credit data for ssn 553-25-8346")
    })
  })

  it('Can correctly aggregate and return Gail\'s credit data', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${apiUrl}/credit-data/287-54-7823`,
    }).then((response) => {
      assert.equal(response.status, 200, "Getting aggregated credit data for ssn 287-54-7823 should return 200 status code")
      assert.equal(response.body.first_name, "Gail", "Data mismatch when returning aggregated credit data for ssn 287-54-7823")
      assert.equal(response.body.last_name, "Shick", "Data mismatch when returning aggregated credit data for ssn 287-54-7823")
      expect(response.body.address).to.match(/\d{1,4} Rainbow Drive Canton, OH 44702$/)
      assert.equal(response.body.assessed_income, 42301, "Data mismatch when returning aggregated credit data for ssn 287-54-7823")
      assert.equal(response.body.balance_of_debt, 23087, "Data mismatch when returning aggregated credit data for ssn 287-54-7823")
      assert.equal(response.body.complaints, true, "Data mismatch when returning aggregated credit data for ssn 287-54-7823")
    })
  })

  it('Can handle requests for non-existent SSNs', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${apiUrl}/credit-data/000-00-0000`,
    }).then((response) => {
      assert.equal(response.status, 404, "Getting aggregated credit data for non-existent SSN should return 404 status code")
    })
  })

  it('Repeated requests should give the same response body thanks to caching', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'GET',
      url: `${apiUrl}/credit-data/424-11-9327`,
    }).then((response1) => {
      assert.equal(response1.status, 200, "Getting aggregated credit data for ssn 424-11-9327 should return 200 status code")

      cy.request({
        failOnStatusCode: false,
        method: 'GET',
        url: `${apiUrl}/credit-data/424-11-9327`,
      }).then((response2) => {
        assert.deepEqual(response1.body, response2.body, "Subsequent requests to fetch the same data should be served from the service’s DB.")
      })

    })
  })

})
