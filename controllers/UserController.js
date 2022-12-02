import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validationResult } from 'express-validator'
import userModel from '../models/User.js'

export const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }

    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const doc = new userModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash
    })

    const user = await doc.save()

    const token = jwt.sign({
      _id: user.id
    }, 'secretKEY', {
      expiresIn: '30d'
    })

    const { passwordHash, ...userData } = user._doc

    res.json({ ...userData, token })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to register...'
    })
  }
}

export const login = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email })

    if (!user) {
      return res.status(403).json({
        message: 'User not found...'
      })
    }
    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
    if (!isValidPass) {
      return res.status(400).json({
        message: 'Invalid login or password...'
      })
    }
    const token = jwt.sign({
      _id: user.id
    },
      'secretKEY'
      ,
      {
        expiresIn: '30d'
      })

    const { passwordHash, ...userData } = user._doc

    res.json({ ...userData, token })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to register...'
    })
  }
}

export const getMe = async (req, res) => {
  try {

    const user = await userModel.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found...'
      })
    }
    const { passwordHash, ...userData } = user._doc
    res.json(userData)

    res.json({
      success: true
    })
  } catch (err) {
    return res.status(500).json({
      message: 'No access...'
    })
  }
}