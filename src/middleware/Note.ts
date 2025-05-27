import type {Request, Response, NextFunction} from 'express'
import Note, {INote} from '../models/Notae'

declare global{
    namespace Express {
        interface Request {
            note : INote
        }
    }
}

export async function NoteExist(req: Request, res: Response, next: NextFunction){
    try {
        const {noteId} = req.params
        const note = await Note.findById(noteId)

        //si no exite
        if(!note){
            const error =  new Error('Nota no encontrada')
            return res.status(404).json({error: error.message})
        }
        req.note = note
        next()
    } catch (error) {
        res.status(500).json({error : "Hubo un error"})
    }
}


export function hasAuthorizationNote(req: Request, res: Response, next: NextFunction){
      //si la persona que la creo es diferente a la que esta autenticada
      if(req.note.createdBy.toString() !== req.user.id.toString()){
        const error = new Error('Accion no valida')
        return res.status(401).json({error: error.message})
    }
    next()
}