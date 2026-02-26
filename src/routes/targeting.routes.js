import { Router } from "express";
import { 
  getTargeting, 
  updateByPackageName, 
  updateByPackageNameAndPlacementName,
  updateAudienceInfo,
  getAudienceOptions 
} from "../controllers/targeting.controller.js";

const router = Router();

router.get("/", getTargeting);

// UPDATE BY PLACEMENT-NAME AND PACKAGE-NAME
router.put("/by-package-and-placement", updateByPackageNameAndPlacementName);

// UPDATE BY PACKAGE-NAME
router.put("/by-package", updateByPackageName);

// UPDATE AUDIENCE INFO
router.put("/audience-info", updateAudienceInfo);

// GET AUDIENCE OPTIONS
router.get("/audience-options", getAudienceOptions);

export default router;