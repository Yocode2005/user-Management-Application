import {Router} from "express";
import {registerUser,deleteUser} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"

const router = Router();

router.route("/register").post(upload.none(),registerUser)
router.route("/delete/:id").delete(deleteUser)
export default router;