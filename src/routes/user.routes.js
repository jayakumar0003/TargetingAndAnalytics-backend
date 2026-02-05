import { Router } from "express";
import { getUsers, updateByPlacementName } from "../controllers/controller.js";

const router = Router();

router.get("/", getUsers);

// UPDATE API
router.put("/by-placement", updateByPlacementName);

export default router;
