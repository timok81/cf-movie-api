# Movie database API

## Overview

A Node/Express API created using MongoDB and Mongoose. Created for a simple movie database site. Contains endpoints for accessing movies and user data. Uses Passport as security middleware.

## Installation

- First, make sure you have npm installed
- Clone the repository: <code>git clone https://github.com/timok81/cf-movie-api.git</code>
- Navigate to project directory
- Run <code>npm install</code> to install dependencies
- change the argument in <code>mongoose.connect(process.env.CONNECTION_URI)</code> in index.js to match your MongoDB connection string
- Run <code>npm start</code> to start server

## Features

- Various endpoints for getting movie data
- Various endpoints for getting and manipulating user data
- Endpoints for creating an account and logging in
- Passport's LocalStrategy and JWTStrategy for security
