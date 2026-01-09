const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const person = require("./models/person");
require("dotenv").config();

const PORT = process.env.PORT;
const app = express();

app.use(cors());

app.use(express.json());
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(express.static("dist"));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    const cuurentDate = new Date();
    const data = `<p>Phonebook has info for ${persons.length} people</p>
    <p>${cuurentDate}</p>`;

    res.send(data);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (!person) return res.status(404).end();

      res.json(person);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  console.log(body);

  if (!body.name) {
    return res.status(400).json({
      error: "Name is missing",
    });
  }

  if (!body.number) {
    return res.status(400).json({
      error: "Number is missing",
    });
  }

  console.log(body.name, body.number);

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const { name, number } = req.body;
  Person.findById(id)
    .then((person) => {
      if (!person) {
        return res.status(404).end();
      }
      person.name = name;
      person.number = number;
      return person.save().then((updatedPerson) => {
        res.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((_) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
