const auth = require("../middleware/auth")
const checkAdmin = require("../middleware/admin")
const mongoose = require("mongoose")
const Fawn = require("fawn")
const express = require("express")
const router = express.Router()
const {Rental, validateRental} = require("../models/rental")
const {Movie} = require("../models/movie")
const { Customer } = require("../models/customer")

Fawn.init(mongoose)

router.get("/", auth, async (req, res) => {
    const rentals = await Rental.find().sort("-dateOut")
    res.send(rentals)
})

router.get("/:id", auth, async (req, res) => {
    const rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).send("The rental with the given ID was not found.")
    res.send(rental)
})

router.post("/", auth, async (req, res) => {
    const result = validateRental(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const customer = await Customer.findById(req.body.customerId)
    if (!customer) return res.status(400).send("Invalid customer.")

    const movie = await Movie.findById(req.body.movieId)
    if (!movie) return res.status(400).send("Invalid movie.")

    if (movie.numberInStock == 0) return res.status(400).send("Movie not in stock")
    
    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
        },
    })
    
    // here we solve a consensus problem with fawn; we must ensure that the rental & stock both save, or neither save.
    // SQL has "transactions" for this. In MongoDB we can use an NPM package called "fawn" to simulate a transaction.
    try {
        new Fawn.Task()
        // fawn save method takes the name of the target collection as first argument, and the document to be saved as the second.
        // fawn update method takes name of the target collection, query string with id of target document, and a mongoose operator to manipulate the target document
        // fawn also has a .remove() method that I am not using here
        // always chain .run() at the end of a fawn operation chain
            .save("rentals", rental)
            .update("movies", { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run()  
    }
    catch (ex) {
        // status 500 indicates an internal server failure
        res.status(500).send("Something failed.")
    }
    console.log("Rental added:", rental)
    res.send(rental)
})

router.put("/:id", auth, async (req, res) => {
    const result = validateRental(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    //const genre = await Genre.findById(req.body.genreId)
    //if (!genre) return res.status(400).send("Invalid genre")

    const rental = await Rental.findByIdAndUpdate(req.params.id, { 
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
        },
    }, {
        new: true
    })

    if (!rental) return res.status(404).send("The rental with the given ID was not found")

    res.send(rental)
})

router.delete("/:id", auth, async (req, res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id)

    if(!rental) return res.status(404).send("The rental with the given ID was not found")

    res.send(rental)
})

module.exports = router