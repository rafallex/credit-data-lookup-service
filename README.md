# Lookup Service - Level 2

Below, you'll find the instructions for getting started with your task. Please read them carefully to avoid unexpected issues. Best of luck!

## Time estimate

Between 2 and 3 hours, plus the time to set up the codebase.

## Mandatory steps before you get started

1. You should already have your project setup from the coding test start page but if not check out [this guide here](https://help.alvalabs.io/en/articles/9028914-how-to-set-up-the-codebase-for-your-coding-test) for more information.
2. Learn [how to get help](https://help.alvalabs.io/en/articles/9028899-how-to-ask-for-help-with-coding-tests) if you run into an issue with your coding test.


## The task

<!--TASK_INSTRUCTIONS_START-->

Your task is to build a backend service that implements the [Lookup Service REST API](https://coding-test-api.alvalabs.io/lookup/api) and integrates with the [Credit Data REST API](https://coding-test-api.alvalabs.io/credit-data/api) to aggregate historical credit data.

<details>
<summary>Lookup Service REST API Specification</summary>

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Lookup Service API",
    "version": "1.0.0"
  },
  "paths": {
    "/ping": {
      "get": {
        "summary": "Healhcheck to make sure the service is up.",
        "responses": {
          "200": {
            "description": "The service is up and running."
          }
        }
      }
    },
    "/credit-data/{ssn}": {
      "get": {
        "summary": "Return aggregated credit data.",
        "parameters": [
          {
            "name": "ssn",
            "in": "path",
            "required": true,
            "description": "Social security number.",
            "schema": {
              "type": "string"
            },
            "example": "424-11-9327"
          }
        ],
        "responses": {
          "200": {
            "description": "Aggregated credit data for given ssn.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreditData"
                },
                "examples": {
                  "CreditDataEmma": {
                    "$ref": "#/components/examples/CreditDataEmma"
                  }
                }
              }
            }
          },
          "404": {
            "description": "Credit data not found for given ssn."
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CreditData": {
        "type": "object",
        "properties": {
          "first_name": {
            "type": "string"
          },
          "last_name": {
            "type": "string"
          },
          "address": {
            "type": "string"
          },
          "assessed_income": {
            "type": "integer"
          },
          "balance_of_debt": {
            "type": "integer"
          },
          "complaints": {
            "type": "boolean"
          }
        }
      }
    },
    "examples": {
      "CreditDataEmma": {
        "value": {
          "first_name": "Emma",
          "last_name": "Gautrey",
          "address": "09 Westend Terrace",
          "assessed_income": 60668,
          "balance_of_debt": 11585,
          "complaints": true
        }
      }
    }
  }
}
```
</details>

<details>
<summary>Credit Data REST API Specification</summary>

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Credit Data API",
    "version": "1.0.0",
    "contact": {

    }
  },
  "paths": {
    "/api/credit-data/personal-details/{ssn}": {
      "get": {
        "operationId": "get~credit_data_api._get_personal_details",
        "summary": "Return personal details.",
        "tags": [
          "credit_data_api"
        ],
        "parameters": [
          {
            "name": "ssn",
            "schema": {
              "type": "string"
            },
            "description": "Social Security Number",
            "required": true,
            "in": "path"
          }
        ],
        "responses": {
          "404": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            },
            "description": "Personal details not found for given ssn."
          },
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "address": {
                      "type": "string",
                      "title": "Address"
                    },
                    "first_name": {
                      "type": "string",
                      "title": "First_Name"
                    },
                    "last_name": {
                      "type": "string",
                      "title": "Last_Name"
                    }
                  }
                }
              }
            },
            "description": "Personal details for given ssn."
          }
        }
      }
    },
    "/api/credit-data/debt/{ssn}": {
      "get": {
        "operationId": "get~credit_data_api._get_debt",
        "summary": "Return debt details.",
        "tags": [
          "credit_data_api"
        ],
        "parameters": [
          {
            "name": "ssn",
            "schema": {
              "type": "string"
            },
            "description": "Social Security Number",
            "required": true,
            "in": "path"
          }
        ],
        "responses": {
          "404": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            },
            "description": "Debt details not found for given ssn."
          },
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "balance_of_debt": {
                      "type": "integer",
                      "format": "int32",
                      "title": "Balance_Of_Debt"
                    },
                    "complaints": {
                      "type": "boolean",
                      "title": "Complaints"
                    }
                  }
                }
              }
            },
            "description": "Debt details for given ssn."
          }
        }
      }
    },
    "/api/credit-data/assessed-income/{ssn}": {
      "get": {
        "operationId": "get~credit_data_api._get_assessed_income",
        "summary": "Return assessed details income.",
        "tags": [
          "credit_data_api"
        ],
        "parameters": [
          {
            "name": "ssn",
            "schema": {
              "type": "string"
            },
            "description": "Social Security Number",
            "required": true,
            "in": "path"
          }
        ],
        "responses": {
          "404": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "code": {
                      "type": "string"
                    },
                    "message": {
                      "type": "string"
                    }
                  }
                }
              }
            },
            "description": "Assessed income not found for given ssn."
          },
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "assessed_income": {
                      "type": "integer",
                      "format": "int32",
                      "title": "Assessed_Income"
                    }
                  }
                }
              }
            },
            "description": "Assessed income for given ssn."
          }
        }
      }
    }
  },
  "servers": [
    {
      "url": "https://coding-test-api.alvalabs.io"
    }
  ]
}
```
</details>


### Solution expectations

- Do your best to make the [provided E2E tests](cypress/e2e/test.cy.js) pass. Check out [this tutorial](https://help.alvalabs.io/en/articles/9028831-how-to-work-with-cypress) to learn how to execute these tests and analyze the results.
- Implement DB caching. The first time the data is fetched from the remote API, it should be stored in an SQLite DB. All subsequent requests to fetch the same data should be served from the service’s DB.
- Be mindful about error handling. The API tests are not restricting any particular service behaviour so it is up to you to choose a solution that feels right.
- Avoid duplication and extract re-usable modules where it makes sense. We want to see your approach to creating a codebase that is easy to maintain.
- Unit test one module of choice. There is no need to test the whole app, as we only want to understand what you take into consideration when writing unit tests.

<!--TASK_INSTRUCTIONS_END-->

## When you are done

1. [Create a new Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) from the branch where you've committed your solution to the default branch of this repository. **Please do not merge the created Pull Request**.
2. Go to your application in [Alva Labs](https://app.alvalabs.io) and submit your test.

---

Authored by [Alva Labs](https://www.alvalabs.io/).
