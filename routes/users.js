const auth = require("../middleware/auth")
const jwt = require("jsonwebtoken")
const config = require("config")
const _ = require("lodash")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const {User, validateUser} = require("../models/user")

router.get("/", auth, async (req, res) => {
    const users = await User.find().sort("name")
    res.send(users)
})

router.get("/me", auth, async (req, res) => {
    // the auth function adds the user._id key & value to the req object.
    const user = await User.findById(req.user._id).select("-password")
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

    const token = user.generateAuthToken()
    
    // passing a header back to contain token for automatic login upon registration of new user
    // first argument is name of the header, second argument is the value (in this case the token).
    res.header("x-auth-token", token).send( _.pick(user, ["_id", "name", "email"]) )
})

router.put("/:id", auth, async (req, res) => {
    const result = validateUser(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const user = await User.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!user) return res.status(404).send("The user with the given ID was not found")

    res.send(user)
})

router.delete("/:id", auth, async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id)

    if(!user) return res.status(404).send("The user with the given ID was not found")

    res.send(user)
})

module.exports = router