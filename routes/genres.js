const auth = require("../middleware/auth")
const checkAdmin = require("../middleware/admin")
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

router.post("/", [auth, checkAdmin], async (req, res) => {

    const result = validateGenre(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    let genre = new Genre({ name: req.body.name })
    
    await genre.save()
    console.log("Genre added:", genre)
    res.send(genre)
})

router.put("/:id", [auth, checkAdmin], async (req, res) => {
    const result = validateGenre(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!genre) return res.status(404).send("The genre with the given ID was not found")

    res.send(genre)
})

router.delete("/:id", [auth, checkAdmin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)

    if(!genre) return res.status(404).send("The genre with the given ID was not found")

    res.send(genre)
})

module.exports = router