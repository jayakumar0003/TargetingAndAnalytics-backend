import { Router } from "express";
import { getMediaplan } from "../controllers/mediaplan.controller.js";

const router = Router();

router.get("/", getMediaplan);

export default router;