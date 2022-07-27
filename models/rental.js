const mongoose = require("mongoose")
const Joi = require("joi")


const Rental = mongoose.model("Rental", new mongoose.Schema({
    customer: {
        // here we make a new schema for customer instead of referencing the existing customerSchema in customer.js
        // this is because the customerSchema might have too much superfluous information not relevant to rental
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            isGold: {
                type: Boolean,
                default: false
            },
            phone: {
                type: String,
                required: true,
                minlength: 10,
                maxlength: 50
            }
        }),
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
}))

function validateRental(rental) {
    const schema = {
        // Joi.objectId was passed to the Joi object in index.js.
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    }
    return Joi.validate(rental, schema)
}

exports.Rental = Rental;
exports.validateRental = validateRental