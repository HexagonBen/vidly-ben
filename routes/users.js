const _ = require("lodash")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const {User, validateUser} = require("../models/user")

router.get("/", async (req, res) => {
    const users = await User.find().sort("name")
    res.send(users)
})

router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send("The user with the given ID was not found.")
    res.send(user)
})

router.post("/", async (req, res) => {
    const result = validateUser(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send("An account with this email already exists")

    // this .pick method comes from the lodash utility library
    user = new User(_.pick(req.body, ["name", "email", "password"]))
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt)

    await user.save()
    console.log("User added:", user)

    // this .pick method comes from the lodash utility library
    res.send( _.pick(user, ["_id", "name", "email"]) )
})

router.put("/:id", async (req, res) => {
    const result = validateUser(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const user = await User.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!user) return res.status(404).send("The user with the given ID was not found")

    res.send(user)
})

router.delete("/:id", async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id)

    if(!user) return res.status(404).send("The user with the given ID was not found")

    res.send(user)
})

module.exports = router