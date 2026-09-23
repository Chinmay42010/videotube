import { Router } from "express";
import { registerUser } from "../controllers/user.controllerss.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { logoutUser } from "../controllers/user.controllerss.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser,
);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);

export default router;
