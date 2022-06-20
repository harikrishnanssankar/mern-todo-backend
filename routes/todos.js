import Todo from "../models/todo.js";
import express from "express";
import Joi from "joi";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET - to get todos
// use auth between / and callback to use te middleware andit will also add a req.user to the req here

router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find().sort({ date: -1 });
    const filteredTodos = todos.filter((todo) => todo.uid === req.user._id);
    res.send(filteredTodos);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

//POST - to create todo

router.post("/", auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(3).max(200),
    author: Joi.string().min(3).max(30),
    uid: Joi.string(),
    isComplete: Joi.boolean(),
    date: Joi.date(),
  }); //.options({abortEarly: false}) to display multiple error msgs

  const { value, error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, author, isComplete, date, uid } = req.body;

  let todo = new Todo({
    name,
    description,
    author,
    isComplete,
    date,
    uid,
  });

  try {
    todo = await todo.save();
    res.send(todo);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

//PUT - to update todo

router.put("/:id", auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(3).max(200),
    author: Joi.string().min(3).max(30),
    uid: Joi.string(),
    isComplete: Joi.boolean(),
    date: Joi.date(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).send("Todo not found");
    if (todo.uid !== req.user._id)
      return res.status(401).send("Update failed, Not Authorized!");

    const { name, author, isComplete, date, uid } = req.body;

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { name, author, isComplete, date, uid },
      { new: true } //to get new todo instead of old version
    );
    res.send(updatedTodo);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//PATCH - to update a single or multiple values inside a todos

router.patch("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).send("Todo not found");
    if (todo.uid !== req.user._id)
      return res.status(401).send("Change Status Failed, Not Authorized!");

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        isComplete: !todo.isComplete, //to change the status from the incomming req
      },
      { new: true }
    );
    res.send(updatedTodo);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//DELETE - to delete single or multiple todos

router.delete("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).send("Todo not found");
    if (todo.uid !== req.user._id)
      return res.status(401).send("Delete failed, Not Authorized!");

    // 1) deleteone()
    // 2) deleteMany()
    // 3) findby id and delete
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id, {
      new: true,
    });
    res.send(deletedTodo);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error.message);
  }
});

export default router;
