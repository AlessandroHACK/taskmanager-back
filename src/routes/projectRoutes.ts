import { Router } from "express"
import { body, param } from "express-validator"
import { ProjectController } from "../controllers/ProjectController"
import { handleInputErrors } from "../middleware/validation"
import { TaskController } from "../controllers/TaskController"
import { ProjectExist } from "../middleware/project"
import { hasAuthorization, taskBelongsToProject, TaskExist } from "../middleware/task"
import { authenticate } from "../middleware/auth"
import { TeamMemberController } from "../controllers/TeamController"
import { NoteController } from "../controllers/NoteController"
import { hasAuthorizationNote, NoteExist } from "../middleware/Note"

const router = Router()

router.use(authenticate) //proteger rutas

router.post('/',
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre delcliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)
router.get('/', ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById

)

router.param('projectId', ProjectExist) //midelware para ver si el proyecto existe

router.put('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre delcliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject

)


router.delete('/:projectId',
    param('projectId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject

)

//Routes for task



router.post('/:projectId/tasks',
    hasAuthorization,
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)


router.get('/:projectId/tasks',
    TaskController.getProjectTask
)

router.param('taskId', TaskExist)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTaskById
)


router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask
)


router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El esatdo no obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

//routes for team

router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('E-mail no valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.post('/:projectId/team',
    hasAuthorization,
    body('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.addMemberById

)

router.delete('/:projectId/team/:userId',
    hasAuthorization,
    param('userId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberById

)
router.get('/:projectId/team', TeamMemberController.getProjecTeam)


//routes for notes


router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido es obligatorio'),  
    handleInputErrors,
    NoteController.createNote

)
router.get('/:projectId/tasks/:taskId/notes',
    handleInputErrors,
    NoteController.getTaskNotes

)

router.param('noteId', NoteExist)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    hasAuthorizationNote,
    param('noteId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    NoteController.deleteTaskNote
)
export default router