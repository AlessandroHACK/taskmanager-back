import mongoose, { Schema, Document, Types } from "mongoose"

export interface INote extends Document {
    content: string
    createdBy: Types.ObjectId
    task: Types.ObjectId
}

const NoteSchema: Schema = new Schema({
    content: {
        type: String,
        required: true,
        minlength: 1,   // Validación adicional
        trim: true,     // Elimina espacios en blanco innecesarios
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User', //referencia al modelo del usario 
        required: true
    },
    task: {
        type: Types.ObjectId,
        ref: 'Task',  //referencia al modelo de task
        required: true
    },
}, { timestamps: true })

const Note = mongoose.model<INote>('Note', NoteSchema)
export default Note