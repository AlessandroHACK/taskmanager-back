import mongoose from "mongoose"
import colors from "colors"
import {exit} from "node:process"

export const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.DATABASE_URL)
       
        const url = `${connection.host}:${connection.port}`
        console.log(colors.cyan.bold(`MongoDB conectado en ${url}`))
    } catch (error) {
        console.log(error.message)
        console.log(colors.red.bold('Error al conectar con MongoDB'))
        exit(1)
    }
}
