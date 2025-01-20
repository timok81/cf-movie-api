const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  uuid = require("uuid");

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

//Returns all movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .populate("Actors")
      .exec()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

//Returns a movie by name
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

//Returns a genre by name
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

//Returns a director by name
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

//Create a user, hash password with bcrypt, validate fields with express-validator
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

//Get all users
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

//Get one user by Username
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

//Update user info by user ID, validate fields with express-validator
app.put(
  "/users/:UserID",
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
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndUpdate(
      { _id: req.params.UserID },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
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

//Removes user by ID(can only be done by an account with the same ID)
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

//Adds a movie to user's favorites, both by ID
app.patch(
  "/users/:UserID/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }

    if (req.user.FavouriteMovies.includes(req.params.MovieID)) {
      return res.status(400).send("Movie already exists in user's favourites");
    }

    const movie = await Movies.findOne({ _id: req.params.MovieID });
    if (!movie) {
      return res.status(400).send("Could not find movie ID in database");
    }

    await Users.findByIdAndUpdate(
      req.params.UserID,
      {
        $addToSet: { FavouriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then(() => {
        res
          .status(200)
          .send("Movie " + req.params.MovieID + " was added to favourites");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Deletes a movie from favorites, by ID
app.delete(
  "/users/:UserID/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user._id != req.params.UserID) {
      return res.status(400).send("Permission denied");
    }

    if (!req.user.FavouriteMovies.includes(req.params.MovieID)) {
      return res.status(400).send("Movie doesn't exist in user's favourites");
    }

    await Users.findByIdAndUpdate(
      req.params.UserID,
      {
        $pull: { FavouriteMovies: req.params.MovieID },
      },
      { new: true }
    )
      .then(() => {
        res
          .status(200)
          .send("Movie " + req.params.MovieID + " was removed from favourites");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Returns all actors
app.get(
  "/actors",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Actors.find()
      .populate("Movies")
      .exec()
      .then((actors) => {
        res.status(201).json(actors);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

//Returns an actor by name
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
