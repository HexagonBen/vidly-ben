const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const {Genre, validateGenre} = require("../models/genre")

router.get("/", async (req, res) => {
    const genres = await Genre.find().sort("name")
    res.send(genres)
})

router.get("/:id", async (req, res) => {
    const genre = await Genre.findById(req.params.id)
    if (!genre) return res.status(404).send("The genre with the given ID was not found.")
    res.send(genre)
})

router.post("/", async (req, res) => {
    const result = validateGenre(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    let genre = new Genre({ name: req.body.name })
    
    try {
        genre = await genre.save()
        console.log(result)
    }
    catch (ex) {
        console.log(ex.message)
    }
    res.send(genre)
})

router.put("/:id", async (req, res) => {
    const result = validateGenre(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!genre) return res.status(404).send("The genre with the given ID was not found")

    res.send(genre)
})

router.delete("/:id", async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)

    if(!genre) return res.status(404).send("The genre with the given ID was not found")

    res.send(genre)
})

module.exports = router