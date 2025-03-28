const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true },
  Released: String,
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
    BirthYear: String,
    DeathYear: String,
    ImagePath: String,
  },
  Actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
  ImagePath: String,
  Featured: Boolean,
  TrailerPath: String,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

//Not using arrow function since it needs to be bound to the user
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let actorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Email: { type: String, required: true },
  BirthYear: String,
  DeathYear: String,
  Movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

//First arg is the name of the collection and gets lowercased and pluralized by mongoose
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);
let Actor = mongoose.model("Actor", actorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Actor = Actor;
