const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema(
  {
    Name: { type: String, required: true },
    Description: { type: String, required: true },
    Released: String,
    Genre: String,
    Director: { type: mongoose.Schema.Types.ObjectId, ref: "Director" },
    Actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
    ImagePath: String,
    Featured: Boolean,
    Trailers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trailer" }],
    Rating: String,
  },
  { timestamps: true }
);

let directorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  BirthYear: String,
  DeathYear: String,
  ImagePath: String,
  Movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

let actorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  BirthYear: String,
  DeathYear: String,
  ImagePath: String,
  Movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

let trailerSchema = mongoose.Schema(
  {
    Movie: String,
    Movie_id: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    Path: String,
  },
  { timestamps: true }
);

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  Role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

//Not using arrow function since it needs to be bound to the user
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

//First arg is the name of the collection and gets lowercased and pluralized by mongoose
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);
let Director = mongoose.model("Director", directorSchema);
let Actor = mongoose.model("Actor", actorSchema);
let Trailer = mongoose.model("Trailer", trailerSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Actor = Actor;
module.exports.Trailer = Trailer;
