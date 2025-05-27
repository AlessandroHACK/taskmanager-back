import { transporter } from "../config/nodemailer"

interface IEmail {
    email : string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmation = async(user : IEmail) => {
        await transporter.sendMail({
            from: 'TaskManager <adminTM@taskmanager.com>',
            to: user.email,
            subject: 'TaskManager - confirma tu email para confirmar la cuenta',
            text: 'TaskManager - Confirma tu cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en TaskManager, confirma tue cuenta para continuar</p>
                    <p>Entra al siguiente enlace</p>
                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                    <p>E ingresa el codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
            `
        })
        console.log('mensaje enviado')
    }


    static sendPasswordResetToken = async(user : IEmail) => {
        await transporter.sendMail({
            from: 'TaskManager <adminTM@taskmanager.com>',
            to: user.email,
            subject: 'TaskManager - Restablece tu password',
            text: 'TaskManager - Restablece tu password',
            html: `<p>Hola ${user.name}, has solicitado restablecer tu password.</p>
                    <p>Entra al siguiente enlace</p>
                    <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer password</a>
                    <p>E ingresa el codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
            `
        })
        console.log('mensaje enviado')
    }
}





