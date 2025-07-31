const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://aapelisyren:${password}@cluster0.cjvjfse.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: String
})

const Person = mongoose.model('Person', personSchema)

const generateId = (persons) => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

if (process.argv.length > 3) {
  //now we will save the new person
  const name = process.argv[3]
  const number = process.argv[4]

  Person.find({}).then(result => {
    const persons = result
    const person = new Person({
      name: name,
      number: number,
      id: generateId(persons)
    })

    person.save().then(result => {
      console.log('person saved!')
      mongoose.connection.close()
    })
  })
}
else {
  //now we will search for persons
  Person.find({}).then(result => {
    console.log("phonebook")
    result.forEach(person => {
      console.log(person.name, " ",person.number)
    })
    mongoose.connection.close()
  })
}
