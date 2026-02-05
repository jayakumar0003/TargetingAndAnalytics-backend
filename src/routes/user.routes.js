import { Router } from "express";
import { getUsers, updateByPackageName, updateByPackageNameAndPlacementName } from "../controllers/controller.js";

const router = Router();

router.get("/", getUsers);

// UPDATE BY PLACEMENT-NAME AND PACKAGE-NAME
router.put("/by-package-and-placement", updateByPackageNameAndPlacementName);

// UPDATE BY PACKAGE-NAME
router.put("/by-package", updateByPackageName)

export default router;
