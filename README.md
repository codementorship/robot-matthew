# ACM Event Bot (Matthew Bot)

A Node app that can create/read/delete events.

When pinged by a cronjob, it checks if there are any events coming up and posts them to Austin Code Mentorship's Slack group.

## Endpoints

- `GET /` loads the forms to add/delete events
- `GET /event` loads all of the upcoming events
- `GET /check` loads upcoming events, posts them to Slack, and deletes them from the database
- `POST /event` adds an event. JSON request body:
    - `"username": "authentication username"`
    - `"password": "authentication password"`
    - `"date": "2019-11-12"`
    - `"description": "real cool event"`
- `POST /delete` deletes an event. JSON request body:
    - `"username": "authentication username"`
    - `"password": "authentication password"`
    - `"id": "1234-abcd-1234-abcd"`

