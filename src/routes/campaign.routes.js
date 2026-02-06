import { Router } from "express";
import { getCampaign } from "../controllers/campaign.controller.js";

const router = Router();

router.get("/", getCampaign);

export default router;