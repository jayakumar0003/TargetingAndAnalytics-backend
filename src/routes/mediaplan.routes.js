import { Router } from "express";
import { getMediaplan, updateMediaPlanAndTargetingAnalyticsTables } from "../controllers/mediaplan.controller.js";

const router = Router();

router.get("/", getMediaplan);

router.put("/update-mediaplan-and-targeting-analytics", updateMediaPlanAndTargetingAnalyticsTables);

export default router;