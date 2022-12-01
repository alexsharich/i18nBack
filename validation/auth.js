import {body} from 'express-validator'

export const registerValidation =[
  body('email','Bad email').isEmail(),
  body('password','Bad password').isLength({min:5}),
  body('fullName','Bad fullName').isLength({min:3}),
  body('avatarUrl','Bad avatarURL').optional().isURL()
]