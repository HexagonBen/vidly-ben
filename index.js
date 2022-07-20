const express = require("express")
const app = express()
const Joi = require("joi")

app.use(express.json())

const genres = [
    {id: 1, name: "sci-fi"},
    {id: 2, name: "comedy"},
    {id: 3, name: "horror"}
]

function validateGenre(genre) {
    const schema = {
        name: Joi.string().min(3).required()
    }
    return Joi.validate(genre, schema)
}


app.get("/", (req, res) => {
    res.send("Welcome to Vidly")
})

app.get("/api/genres", (req, res) => {
    res.send(genres)
})

app.get("/api/genres/:id", (req, res) => {
    const genre = genres.find(g => g.id == parseInt(req.params.id))
    if (!genre) return res.status(404).send("The genre with the given ID was not found.")
    res.send(genre)
})

app.post("/api/genres", (req, res) => {
    const result = validateGenre(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const genre = {
        id: genres.length + 1,
        name: req.body.name
    }

    genres.push(genre)
    res.send(genre)
})

app.put("/api/genres/:id", (req, res) => {
    const genre = genres.find(g => g.id == parseInt(req.params.id))
    if (!genre) return res.status(404).send("The genre with the given ID was not found")

    const result = validateGenre(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    genre.name = req.body.name
    res.send(genre)
})

app.delete("/api/genres/:id", (req, res) => {
    const genre = genres.find(g => g.id == req.params.id)
    if(!genre) return res.status(404).send("The genre with the given ID was not found")

    const index = genres.indexOf(genre)
    genres.splice(index, 1)
    res.send(genre)
})


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`))