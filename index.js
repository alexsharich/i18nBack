import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'

import {registerValidation} from './validation/auth.js'
import userModel from './models/User.js'

mongoose.connect('mongodb+srv://alexandev444:s201290935s@cluster0.zuwj3nx.mongodb.net/blog?retryWrites=true&w=majority')
  .then(() => { console.log('DB ok') })
  .catch((err) => { console.log('DB error', err) })// подключение к базе данных

const app = express()

app.use(express.json())

app.post('/auth/register',registerValidation,async (req,res)=>{
 try{
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json(errors.array())
  }

  const password = req.body.password
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password,salt)

const doc = new userModel({
  email:req.body.email,
  fullName:req.body.fullName,
  avatarUrl:req.body.avatarUrl,
  passwordHash:hash
})

const user = await doc.save()

const token = jwt.sign({
  _id:user.id
},'secretKEY',{
  expiresIn:'30d'
})

const {passwordHash,...userData} = user._doc

  res.json({...userData,token})
 } 
 catch (err){
  console.log(err)
res.status(500).json({
  message: 'Failed to register...'
})
 }
})

app.listen(4444, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log('Server OK')
})