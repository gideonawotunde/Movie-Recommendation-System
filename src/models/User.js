const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const FavoriteMovieSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  genres: [String],
  actors: [String],
}, { _id: false });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    favorites: [FavoriteMovieSchema],
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.addToFavorites = function (movie) {
  const movieObjectId = mongoose.Types.ObjectId(movie.movieId);
  const movieExists = this.favorites.some(favorite => favorite.movieId.equals(movieObjectId));

  if (!movieExists) {
    this.favorites.push({ movieId: movieObjectId, genres: movie.genres, actors: movie.actors });
    return this.save();
  }
};

UserSchema.methods.removeFromFavorites = function (movieId) {
  const movieObjectId = mongoose.Types.ObjectId(movieId);
  this.favorites = this.favorites.filter(favorite => !favorite.movieId.equals(movieObjectId));
  return this.save();
};


const User = mongoose.model("User", UserSchema);

module.exports = User;
