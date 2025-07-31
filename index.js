require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

// let persons = [
//   {
//     "name": "Arto Hellas",
//     "number": "040-123456",
//     "id": "1"
//   },
//   {
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523",
//     "id": "2"
//   },
//   {
//     "name": "Dan Abramov",
//     "number": "12-43-234345",
//     "id": "3"
//   },
//   {
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122",
//     "id": "4"
//   }
// ]

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(express.static('dist'))
app.use(express.json())

var morgan = require('morgan')

// app.use(morgan('tiny'))
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  })
)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(ps => {//ps stands for persons
    console.log("getting persons")
    response.json(ps)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(ps => {
    const message = `Phonebook has info for ${ps.length} people<br>${Date()}`
    response.send(message)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      console.log("\n HERE \n")
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error)) /*{
      console.log("\n\nAND HERE\n\n")
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })*/
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
  // const id = request.params.id
  // persons = persons.filter(person => person.id !== id)

  // response.status(204).end()
})

// const generateId = () => {
//   const maxId = persons.length > 0
//     ? Math.max(...persons.map(n => Number(n.id)))
//     : 0
//   return String(maxId + 1)
// }

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  // if (!body.name) {
  //   return response.status(400).json({ 
  //     error: 'name missing' 
  //   })
  // }
  // if (!body.number) {
  //   return response.status(400).json({ 
  //     error: 'number missing' 
  //   })
  // }
  // if (persons.map(p => p.name).includes(body.name)) {
  //   return response.status(409).json({ 
  //     error: 'name must be unique' 
  //   })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
    // id: generateId(),
  })

  // persons = persons.concat(person)

  person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
