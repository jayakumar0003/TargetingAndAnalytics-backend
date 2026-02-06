import { Router } from "express";
import { getTargeting, updateByLineItem, updateByPackageName, updateByPackageNameAndPlacementName } from "../controllers/targeting.controller.js";

const router = Router();

router.get("/", getTargeting);

// UPDATE BY PLACEMENT-NAME AND PACKAGE-NAME
router.put("/by-package-and-placement", updateByPackageNameAndPlacementName);

// UPDATE BY PACKAGE-NAME
router.put("/by-package", updateByPackageName)

router.put("/by-line-item", updateByLineItem)

export default router;