import express from "express";
import {
  getStudiesBls,
  createStudiesBlsRow,
  updateStudiesBlsRow,
  getPackagesByCampaignDate,
} from "../controllers/studiesBls.controller.js";

const router = express.Router();

router.get("/", getStudiesBls);

router.post("/create", createStudiesBlsRow);

router.put("/update", updateStudiesBlsRow);

router.get("/filter-packages-by-date", getPackagesByCampaignDate);

export default router;