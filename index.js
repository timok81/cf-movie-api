const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan");

const mongoose = require("mongoose");
require("dotenv").config();

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Actors = Models.Actor;
const Directors = Models.Director;
const Trailers = Models.Trailer;

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
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//------------------------------------------------------------------//

app.get("/", (req, res) => {
  res.send("<h1>Movie database API</h1><a href='/api-docs'>Documentation</a>");
});

// Adds a movie to db and converts actor/director/trailer to database IDs
// Updates actors and directors movies arrays with this movie's id
// Creates placeholder db docs for actors and directors that don't exist
app.post(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user;
    if (user.Role !== "admin") {
      res.status(403).send("Unauthorized");
    }

    const bodyData = req.body;
    if (!bodyData) {
      res.status(500).send("Error: " + error);
    }

    try {
      // Grab existing director id or create a new director and grab its id if director doesn't exist in db yet
      let databaseDirector = await Directors.findOne({
        Name: bodyData.Director,
      });
      if (!databaseDirector) {
        await Directors.create({
          Name: bodyData.Director,
          Bio: "No biography available",
          BirthYear: "????",
          DeathYear: null,
          Movies: [],
          ImagePath:
            "https://moviemovie-7703363b92cb.herokuapp.com/images/sample-movie.jpg",
        });
        const justCreatedDirector = await Directors.findOne({
          Name: bodyData.Director,
        });
        bodyData.Director = justCreatedDirector._id;
      } else {
        bodyData.Director = databaseDirector._id;
      }

      let databaseActors = await Actors.find();
      let actorIdArray = [];

      // Grab existing actor id or create a new actor and grab its id if actor doesn't exist in db yet
      bodyData.Actors.forEach(async (element) => {
        const matchingActor = databaseActors.find(
          (actor) => actor.Name == element
        );
        if (!matchingActor) {
          await Actors.create({
            Name: element,
            Bio: "No biography available",
            BirthYear: "????",
            DeathYear: null,
            Movies: [],
            ImagePath:
              "https://moviemovie-7703363b92cb.herokuapp.com/images/sample-movie.jpg",
          });
          const justCreatedActor = await Actors.findOne({ Name: element });
          actorIdArray.push(justCreatedActor._id);
        } else {
          actorIdArray.push(matchingActor._id);
        }
      });

      bodyData.Actors = actorIdArray;

      let trailers = await Trailers.find({ Movie: bodyData.Name });
      trailers.forEach((element) => {
        bodyData.Trailers.push(element._id);
      });

      const dbMovie = await Movies.create(bodyData);

      await Actors.updateMany(
        { _id: { $in: dbMovie.Actors } },
        { $addToSet: { Movies: dbMovie._id } }
      );
      await Directors.updateOne(
        { _id: { $in: dbMovie.Director } },
        { $addToSet: { Movies: dbMovie._id } }
      );
      await Trailers.updateMany(
        { _id: { $in: dbMovie.Trailers } },
        { Movie_id: dbMovie._id }
      );

      res.status(200).json({ dbMovie });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .populate("Director")
      .populate("Actors")
      .populate("Trailers")
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

app.get(
  "/movies/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Name: req.params.Name })
      .populate("Director")
      .populate("Actors")
      .populate("Trailers")
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

app.get(
  "/genres/:Genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Genre: req.params.Genre })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

app.get(
  "/directors/:Director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Directors.findOne({ "Director.Name": req.params.Director })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

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

app.get(
  "/directors",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Directors.find()
      .populate("Movies")
      .exec()
      .then((directors) => {
        res.status(200).json(directors);
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("Error: " + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
