import type { Request, Response } from 'express'
import User from '../models/User'
import bcrypt from 'bcrypt'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'
export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            //prevenir duplicados
            const userExist = await User.findOne({ email })

            if (userExist) {
                const error = new Error('El suario ya esta registrado')

            }

            //crea  usuario
            const user = new User(req.body)

            //hash password
            user.password = await hashPassword(password)

            //generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //enviar email
            AuthEmail.sendConfirmation({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada con exito, revisa tu email para confirmar')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }



    static confirmAccount = async (req: Request, res: Response) => {
        try {

            const { token } = req.body
            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })

            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })


            if (!user) {
                const error = new Error('Usaurio no encotrado')
                return res.status(404).json({ error: error.message })
            }

            if (!user.confirmed) {

                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //enviar email
                AuthEmail.sendConfirmation({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('Cuenta no confirmada, hemos enviado un email de confimación')
                return res.status(401).json({ error: error.message })
            }

            //revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                return res.status(401).json({ error: error.message })
            }

            //generar jwt
            const token = generateJWT({ id: user.id })

            res.send(token)

        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }




    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El Usuario no esta registrado')
                return res.status(404).json({ error: error.message })
            }

            if (user.confirmed) {
                const error = new Error('El Usuario ya esta confirmado')
                return res.status(403).json({ error: error.message })
            }

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar el email
            AuthEmail.sendConfirmation({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Se envió un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }




    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El Usuario no esta registrado')
                return res.status(404).json({ error: error.message })
            }

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // enviar el email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })



            res.send('revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }



    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(404).json({ error: error.message })
            }
            res.send('Token válido, Define tu nuevo password')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {

            const { token } = req.params
            const { password } = req.body
            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({ error: error.message })

            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('El password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }



    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExist = await User.findOne({ email })

        // Si existe un usuario con el mismo email, pero su ID no coincide con el del usuario actual,
        // lanza un error porque no se permite duplicar emails entre usuarios.
        if (userExist && userExist.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta registrado')
            return res.status(900).json({ error: error.message })
        }

        // Actualiza las propiedades del usuario actual con los nuevos valores recibidos.
        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil Actualizado')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        //revisar password
        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            return res.status(401).json({ error: error.message })
        }

        try {
            user.password = await hashPassword(password) //hash nuevo password
            await user.save()
            res.send('El password se modifico correctamente')
        } catch (error) {
            res.status(500).json({ error: "Hubo un error" })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('El Password es incorrecto')
            return res.status(401).json({error: error.message})
        }

        res.send('Password Correcto')
    }
}

