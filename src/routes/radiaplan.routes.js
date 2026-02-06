import { Router } from "express";
import { getRadiaplan } from "../controllers/radiaplan.controller.js";

const router = Router();

router.get("/", getRadiaplan);

export default router;