# Movie database server-side

## Overview

The server-side component of a movie database app.

# Project goals

The goal of the project was to build the REST API and database for a movie database app.\
Client-side: https://github.com/timok81/cf-movies-client

## Feature requirements

- Return list of all movies to user
- Return data about a single movie to user
- Return data about a genre to user
- Return data about a director to user
- Allow users to register
- Allow users to deregister
- Allow users to add movies to their favorites
- Allow users to delete movies from their favorites
- Allow users to change their user info

## Technical requirements

- The API must be a Node.js and Express application.
- The API must use REST architecture, with URL endpoints corresponding to the data operations listed above
- The API must use at least three middleware modules, such as the body-parser package for reading data from requests and morgan for logging.
- The API must use a “package.json” file.
- The database must be built using MongoDB.
- The business logic must be modeled with Mongoose.
- The API must provide movie information in JSON format.
- The JavaScript code must be error-free.
- The API must be tested in Postman.
- The API must include user authentication and authorization code.
- The API must include data validation logic.
- The API must meet data security regulations.
- The API source code must be deployed to a publicly accessible platform like GitHub.
- The API must be deployed to Heroku.