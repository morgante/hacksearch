## HackSearch
We hacked Facebook Graph Search at YHack 2013 to add a couple of our own custom parameters through computer vision and machine learning.

## Documentation/usage
Post information via Curl:
~~~sh
curl -v -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"user_id":"193","people":["673965129"],"filters":{"popularity": {"$gt": "me"}}'  http://localhost:8000/api/filter/friends
~~~

### Filters
* popularity:
** {$gt: "me"} means greater than me
** {$lt: "me"} means less than me