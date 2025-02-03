const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  uuid = require("uuid"),
  swaggerJsDoc = require("swagger-jsdoc"),
  swaggerUIExpress = require("swagger-ui-express");

const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Actors = Models.Actor;

mongoose.connect(process.env.CONNECTION_URI);

const app = express();
app.use(express.urlencoded({ extended: true }));
const { check, validationResult } = require("express-validator");
app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Movies API",
      version: "1.0.0",
      description: "API documentation for the Movies API",
    },
    servers: [
      {
        url: "https://moviemovie-7703363b92cb.herokuapp.com/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["index.js", "auth.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(
  "/api-documentation",
  swaggerUIExpress.serve,
  swaggerUIExpress.setup(swaggerDocs)
);

const cors = require("cors");
app.use(cors());

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.use(morgan("common"));
app.use(express.static("public"));

//------------------------------------------------------------------//

app.get("/", (req, res) => {
  res.send("Welcome to the movie database!");
});

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Retrieve all movies
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Movies
 *     responses:
 *       200:
 *         description: A list of movies.
 *       400:
 *         description: Bad request, error occurred.
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .populate("Actors")
      .exec()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /movies/{Name}:
 *   get:
 *     summary: Retrieve a movie by its name
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: path
 *         name: Name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the movie
 *     responses:
 *       200:
 *         description: A movie object
 *
 *       400:
 *         description: Bad request, error occurred.
 *
 *       404:
 *         description: Movie not found
 *
 */
app.get(
  "/movies/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Name: req.params.Name })
      .populate("Actors")
      .exec()
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /genres/{Name}:
 *   get:
 *     summary: Retrieve a genre by its name
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Genres
 *     parameters:
 *       - in: path
 *         name: Name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the genre
 *     responses:
 *       200:
 *         description: A Genre object
 *
 *       400:
 *         description: Bad request, error occurred.
 *
 *       404:
 *         description: Genre not found
 *
 */
app.get(
  "/genres/:Genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.Genre })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /directors/{Name}:
 *   get:
 *     summary: Retrieve a director by their name
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Directors
 *     parameters:
 *       - in: path
 *         name: Name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the director
 *     responses:
 *       200:
 *         description: A director object
 *
 *       400:
 *         description: Bad request, error occurred.
 *
 *       404:
 *         description: Genre not found
 *
 */
app.get(
  "/directors/:Director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.Director })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user account
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Password
 *               - Email
 *             properties:
 *               Username:
 *                 type: string
 *                 description: The username for the new account.
 *                 example: johndoe
 *               Password:
 *                 type: string
 *                 description: The password for the new account. Must be at least 8 characters and contain no spaces.
 *                 example: password123
 *               Email:
 *                 type: string
 *                 description: The email for the new account.
 *                 example: johndoe@example.com
 *               Birthday:
 *                 type: string
 *                 format: date
 *                 description: The birthday of the user.
 *                 example: 1990-01-01
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user ID.
 *                   example: 60b6c0fda5b4f63d2c8e4b9e
 *                 Username:
 *                   type: string
 *                   description: The username.
 *                   example: johndoe
 *                 Email:
 *                   type: string
 *                   description: The email address.
 *                   example: johndoe@example.com
 *                 Birthday:
 *                   type: string
 *                   format: date
 *                   description: The birthday of the user.
 *                   example: 1990-01-01
 *       400:
 *         description: Username already exists.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: johndoe already exists
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: The validation error message.
 *                         example: Password must not have spaces
 *                       param:
 *                         type: string
 *                         description: The field that caused the error.
 *                         example: Password
 *                       location:
 *                         type: string
 *                         description: The location of the field (body, query, params, etc.).
 *                         example: body
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 Error: some error message
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Password", "Password must have at least 8 characters").isLength({
      min: 8,
    }),
    check("Password")
      .custom((value) => !/\s/.test(value))
      .withMessage("Password must not have spaces"),
    check("Email", "Invalid Email").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user)
          return res.status(400).send(req.body.Username + " already exists");
        else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => res.status(201).json(user))
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users.
 *       500:
 *         description: Bad request, error occurred.
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /users/{Name}:
 *   get:
 *     summary: Retrieve a user by their name
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: Name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the user
 *     responses:
 *       200:
 *         description: A user object
 *
 *       400:
 *         description: Bad request, error occurred.
 *
 *       404:
 *         description: Genre not found
 *
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ Username: req.params.Username });

      if (!user) {
        return res.status(400).send("User was not found");
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @swagger
 * /users/{UserID}:
 *   put:
 *     summary: Update user information
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose information is to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Email
 *             properties:
 *               Username:
 *                 type: string
 *                 description: The new username.
 *                 example: john_doe_updated
 *               Password:
 *                 type: string
 *                 description: The new password. Must be at least 8 characters and contain no spaces.
 *                 example: newpassword123
 *               Email:
 *                 type: string
 *                 description: The new email address.
 *                 example: john.doe.updated@example.com
 *               Birthday:
 *                 type: string
 *                 format: date
 *                 description: The new birthday of the user.
 *                 example: 1992-02-15
 *     responses:
 *       200:
 *         description: User information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user ID.
 *                   example: 60b6c0fda5b4f63d2c8e4b9e
 *                 Username:
 *                   type: string
 *                   description: The updated username.
 *                   example: john_doe_updated
 *                 Email:
 *                   type: string
 *                   description: The updated email address.
 *                   example: john.doe.updated@example.com
 *                 Birthday:
 *                   type: string
 *                   format: date
 *                   description: The updated birthday of the user.
 *                   example: 1992-02-15
 *       400:
 *         description: Permission denied or user not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Permission denied
 *       422:
 *         description: Validation error (e.g., invalid username, password, or email).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: The validation error message.
 *                         example: Password must not have spaces
 *                       param:
 *                         type: string
 *                         description: The field that caused the error.
 *                         example: Password
 *                       location:
 *                         type: string
 *                         description: The location of the field (body, query, params, etc.).
 *                         example: body
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 Error: some error message
 */
app.put(
  "/users/:UserID",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must have at least 8 characters")
      .custom((value) => !/\s/.test(value))
      .withMessage("Password must not have spaces"),

    check("Email", "Invalid Email").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }
    const updateFields = {
      Username: req.body.Username,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
    };

    if (req.body.Password) {
      updateFields.Password = Users.hashPassword(req.body.Password);
    }
    await Users.findOneAndUpdate(
      { _id: req.params.UserID },
      { $set: updateFields },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /users/{UserID}:
 *   delete:
 *     summary: Remove a user from the database
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to be deleted.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User 60b6c0fda5b4f63d2c8e4b9e was deleted.
 *       400:
 *         description: Permission denied or user not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User 60b6c0fda5b4f63d2c8e4b9e was not found
 *       422:
 *         description: Validation error (invalid user ID).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: The validation error message.
 *                         example: Invalid user ID format
 *                       param:
 *                         type: string
 *                         description: The field that caused the error.
 *                         example: UserID
 *                       location:
 *                         type: string
 *                         description: The location of the field (body, query, params, etc.).
 *                         example: params
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                Error: some error message
 */
app.delete(
  "/users/:UserID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }
    await Users.findByIdAndDelete(req.params.UserID)
      .then((user) => {
        if (!user) {
          res.status(400).send("User " + req.params.UserID + " was not found");
        } else {
          res.status(200).send("User " + req.params.UserID + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /users/{UserID}/movies/{MovieID}:
 *   patch:
 *     summary: Add a movie to a user's favourite list by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user.
 *       - in: path
 *         name: MovieID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to be added to favourites.
 *     responses:
 *       200:
 *         description: Movie successfully added to the user's favourites or already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user ID.
 *                   example: 60b6c0fda5b4f63d2c8e4b9e
 *                 FavouriteMovies:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of favourite movie IDs.
 *       400:
 *         description: Permission denied or movie not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Could not find movie ID in database
 *       404:
 *         description: User not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 Error: some error message
 */
app.patch(
  "/users/:UserID/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }

    if (req.user.FavouriteMovies.includes(req.params.MovieID)) {
      return res.status(200).json(req.user);
    }

    const movie = await Movies.findOne({ _id: req.params.MovieID });
    if (!movie) {
      return res.status(400).send("Could not find movie ID in database");
    }

    try {
      const updatedUser = await Users.findByIdAndUpdate(
        req.params.UserID,
        {
          $addToSet: { FavouriteMovies: req.params.MovieID },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @swagger
 * /users/{UserID}/movies/{MovieID}:
 *   delete:
 *     summary: Remove a movie from a user's favourite list by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user.
 *       - in: path
 *         name: MovieID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to be removed from favourites.
 *     responses:
 *       200:
 *         description: Movie successfully removed from the user's favourites or was not in the list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user ID.
 *                   example: 60b6c0fda5b4f63d2c8e4b9e
 *                 FavouriteMovies:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of favourite movie IDs.
 *       400:
 *         description: Permission denied.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Permission denied
 *       404:
 *         description: User not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 Error: some error message
 */
app.delete(
  "/users/:UserID/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }

    if (!req.user.FavouriteMovies.includes(req.params.MovieID)) {
      return res.status(200).json(req.user);
    }

    try {
      const updatedUser = await Users.findByIdAndUpdate(
        req.params.UserID,
        {
          $pull: { FavouriteMovies: req.params.MovieID },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * @swagger
 * /actors:
 *   get:
 *     summary: Retrieve all actors
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Actors
 *     responses:
 *       200:
 *         description: A list of actors.
 *       400:
 *         description: Bad request, error occurred.
 */
app.get(
  "/actors",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Actors.find()
      .populate("Movies")
      .exec()
      .then((actors) => {
        res.status(200).json(actors);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

/**
 * @swagger
 * /actors/{Name}:
 *   get:
 *     summary: Retrieve an actor by their name
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Actors
 *     parameters:
 *       - in: path
 *         name: Name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the actor
 *     responses:
 *       200:
 *         description: An actor object
 *
 *       400:
 *         description: Bad request, error occurred.
 *
 *       404:
 *         description: Genre not found
 *
 */
app.get(
  "/actors/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Actors.findOne({ Name: req.params.Name })
      .populate("Movies")
      .exec()
      .then((actor) => {
        res.json(actor);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  req.status(500).send("Error");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
