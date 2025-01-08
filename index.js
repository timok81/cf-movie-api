const express = require("express"),
  morgan = require("morgan");

const app = express();

let movies = [
  {
    title: "Blade Runner",
    director: "Ridley Scott",
    released: 1982,
  },
  {
    title: "Lord of the rings",
    director: "Peter Jackson",
    released: 2001,
  },
  {
    title: "Dune",
    director: "Denis Villeneuve",
    released: 2021,
  },
  {
    title: "Ghost in the shell",
    director: "Mamoru Oshii",
    released: 1995,
  },
  {
    title: "Knives out",
    director: "Rian Johnson",
    released: 2020,
  },
  {
    title: "Spirited away",
    director: "Hayao Miyazaki",
    released: 2001,
  },
  {
    title: "The Abyss",
    director: "James Cameron",
    released: 1989,
  },
  {
    title: "Godzilla minus one",
    director: "Takashi Yamazaki",
    released: 2023,
  },
  {
    title: "The Anchorman",
    director: "Adam McKay",
    released: 2004,
  },
  {
    title: "The Big Lebowsky",
    director: "Joel/Ethan Coen",
    released: 1998,
  },
];

app.use(morgan("common"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Welcome to the movie database!");
});

app.get("/movies", (req, res) => {
  res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  req.status(500).send("Error");
});

app.listen(8080, () => {
  console.log("Listening to port 8080");
});
