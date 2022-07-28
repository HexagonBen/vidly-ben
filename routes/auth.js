const Joi = require("joi")
const _ = require("lodash")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const {User} = require("../models/user")

// the post method doesn't store anything in the databse so there is nothing to "get"
/*
router.get("/", async (req, res) => {
    const users = await User.find().sort("name")
    res.send(users)
})

router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send("The user with the given ID was not found.")
    res.send(user)
})
*/

// this post method doesn't create an entry. It merely facilitates validation of the supplied email & password.
router.post("/", async (req, res) => {
    const result = validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send("Invalid email or password")

    // bcrypt automatically retrieves the salt for the hashed password to compare & authenticate
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send("Invalid email or passwrod")

    // jwt first argument is payload, second argument is the private key
    const token = user.generateAuthToken()
    res.send(token);
})

// it may not make sense to have other HTTP methods other than the post, since there is no "auth" data stored in the database to read, update, or delete.
/*
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
*/

// auth validation
function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    }
    return Joi.validate(req, schema)
}

module.exports = router