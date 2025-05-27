import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    // Obtiene el token del header Authorization
    const bearer = req.headers.authorization

    if (!bearer) {
        const error = new Error('No autorizado')
        return res.status(401).json({ error: error.message })
    }

// Extrae el token del formato "Bearer <token>"
    const [, token] = bearer.split(' ')

    try {
         // Verifica el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (typeof decoded === 'object' && decoded.id) {
               // Busca el usuario en la base de datos usando el id del token y selecciona ciertos campos
            const user = await User.findById(decoded.id).select('_id name email')

             // Si el usuario existe, lo asigna a la propiedad req.user para que esté disponible en la solicitud
            if (user) {
                req.user = user
                next()
            } else {
                res.status(500).json({ error: 'Token no valido' })
            }

        }
    } catch (error) {
        res.status(500).json({ error: 'Token no valido' })
    }


}