# Raspored API

Node/Express/MongoDB REST API for class schedule that uses JWT authentication.

[![Known Vulnerabilities](https://snyk.io/test/github/recycleTheC/raspored_api/badge.svg?targetFile=package.json)](https://snyk.io/test/github/recycleTheC/raspored_api?targetFile=package.json)

## Getting Started

```
  Create the config/default.json file and add your mongoURI and your jwtSecret
```

```bash
  npm install
  npm run server # Runs on http://localhost:5000
```

# API Usage & Endpoints

## Register a User [POST /api/users]

- Request: Add user and request JSON web token

  - Headers

        Content-type: application/json

  - Body

            {
              "name": "",
              "email": "",
              "password": ""
            }

- Response: 200 (application/json)

  - Body

          {
            "token": ""
          }

## Login with a User [POST /api/auth]

- Request: Login with credentials to recieve a JSON web token

  - Headers

        Content-type: application/json

  - Body

            {
              "email": "",
              "password": ""
            }

- Response: 200 (application/json)

  - Body

          {
            "token": ""
          }

## Further Development

Server application is still in development and planned to be project for my final exam.
