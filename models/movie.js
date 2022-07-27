const mongoose = require("mongoose")
const Joi = require("joi")
const {Genre} = require("./genre")


const Movie = mongoose.model("Movie", new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre"
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    }
}))

function validateMovie(movie) {
    const schema = {
        title: Joi.string().min(5).max(50).required(),
        // note that we call this genreId and not genre, because we are pointing to the genre with its reference id
        // genreId is saved into the variable "genre" in the post & put routes to be fed into Mongoose validation
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).required(),
        dailyRentalRate: Joi.number().min(0).required()
    }
    return Joi.validate(movie, schema)
}

exports.Movie = Movie;
exports.validateMovie = validateMovie