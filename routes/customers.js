const auth = require("../middleware/auth")
const checkAdmin = require("../middleware/admin")
const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const {Customer, validateCustomer} = require("../models/customer")

router.get("/", [auth, checkAdmin], async (req, res) => {
    const customers = await Customer.find().sort("name")
    res.send(customers)
})

router.get("/:id", [auth, checkAdmin], async (req, res) => {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).send("The customer with the given ID was not found.")
    res.send(customer)
})

router.post("/", auth, async (req, res) => {
    const result = validateCustomer(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    let customer = new Customer({ 
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    })
    await customer.save()
    console.log("Customer added:", customer)
    res.send(customer)
})

router.put("/:id", [auth, checkAdmin], async (req, res) => {
    const result = validateCustomer(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const customer = await Customer.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!customer) return res.status(404).send("The customer with the given ID was not found")

    res.send(customer)
})

router.delete("/:id", [auth, checkAdmin], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id)

    if(!customer) return res.status(404).send("The customer with the given ID was not found")

    res.send(customer)
})

module.exports = router