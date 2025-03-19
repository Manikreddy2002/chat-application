import express from "express";
import { register } from "../controllers/user.js";
import {login } from "../controllers/user.js";
import{logout} from "../controllers/user.js";
const router =express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);

export default router;