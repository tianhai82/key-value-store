# URL
Base URL: https://object-wywr5ucsda-uc.a.run.app/object

## GET endpoints
- `https://object-wywr5ucsda-uc.a.run.app/object/[key]`
- `https://object-wywr5ucsda-uc.a.run.app/object/[key]?timestamp=[unix-timestamp]`

## POST endpoint
- https://object-wywr5ucsda-uc.a.run.app/object
  - body must be a json object with only __1 single field__
  - example 1: `{ "apple": "red" }`
  - example 2: `{ "apple": { "color": "red", "size": "small"} }`

# Assumptions
1. Post request only accepts an object with one key
2. Get request with timestamp that is older then all entries will return 404
3. Get request with no timestamp will return the latest entry if available
4. Get request with timestamp will return the latest entry that is smaller than the timestamp

# Deployment and Hosting
- Project is built into a Docker image with node:14 as base
- Docker image deployed into Google Cloud Run (platform managed) container

# Database
- Mongodb hosted in https://cloud.mongodb.com

