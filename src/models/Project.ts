import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose"
import Task, { ITask } from "./Task"
import { IUser } from "./User"
import Note from "./Notae"


export interface IProject extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[]
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, { timestamps: true })

// Middleware 
ProjectSchema.pre('deleteOne', { document: true }, async function() {
    // Obtiene el ID del proyecto que se va a eliminar
    const projectId = this._id;
    // Si no hay un ID de proyecto, detiene la ejecución
    if (!projectId) return;

    // Busca todas las tareas que pertenecen a este proyecto
    const tasks = await Task.find({ project: projectId });

    // Para cada tarea encontrada, elimina todas las notas asociadas a ella
    for (const task of tasks) {
        await Note.deleteMany({ task: task.id });
    }

    // Elimina todas las tareas asociadas a este proyecto
    await Task.deleteMany({ project: projectId });
});

const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project