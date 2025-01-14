const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

let actorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Email: { type: String, required: true },
  BirthYear: String,
  DeathYear: String,
  Movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});


//First arg gets lowercased and pluralized by mongoose
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);
let Actor = mongoose.model("Actor", actorSchema)

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Actor = Actor;