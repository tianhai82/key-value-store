Assumptions
1. Post request only accepts an object with one key
2. Get request with timestamp that is older then all entries will return 404
3. Get request with no timestamp will return the latest entry
4. Get request with timestamp will return the latest entry that is smaller than the timestamp


Database
- Mongodb hosted in https://cloud.mongodb.com

