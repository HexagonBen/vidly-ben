const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const Joi = require("joi")

const Customer = mongoose.model("Customer", new mongoose.Schema({
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
}))

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        isGold: Joi.boolean(),
        phone: Joi.string().min(10).max(50).required()
    }
    return Joi.validate(customer, schema)
}

router.get("/", async (req, res) => {
    const customers = await Customer.find().sort("name")
    res.send(customers)
})

router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).send("The customer with the given ID was not found.")
    res.send(customer)
})

router.post("/", async (req, res) => {
    const result = validateCustomer(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    let customer = new Customer({ 
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    })
    
    try {
        customer = await customer.save()
        console.log(result)
    }
    catch (ex) {
        console.log(ex.message)
    }
    res.send(customer)
})

router.put("/:id", async (req, res) => {
    const result = validateCustomer(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const customer = await Customer.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!customer) return res.status(404).send("The customer with the given ID was not found")

    res.send(customer)
})

router.delete("/:id", async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id)

    if(!customer) return res.status(404).send("The customer with the given ID was not found")

    res.send(customer)
})

module.exports = router