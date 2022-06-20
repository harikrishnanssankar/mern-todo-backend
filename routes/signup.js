import express from "express";
import Joi from "joi";
import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(3).max(300).required().email(),
    password: Joi.string().min(6).max(200).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("Email already in use");

    const {name, email, password} = req.body

    user = new User({
        name, password, email
    })

    const salt = await bcrypt.genSalt(10) 
    user.password = await bcrypt.hash(user.password, salt)

    await user.save()
    
    const secretKey = process.env.SECRET_KEY
    const token = jwt.sign({_id:user._id, name:user.name, email:user.email}, secretKey )
    res.send(token)

  } catch (error) {
    res.status(500).send(error.message);
  }
});


export default router
