import express from "express";
import {
  getStudiesBls,
  createStudiesBlsRow,
  updateStudiesBlsRow,
} from "../controllers/studiesBls.controller.js";

const router = express.Router();

router.get("/", getStudiesBls);

router.post("/create", createStudiesBlsRow);

router.put("/update", updateStudiesBlsRow);

export default router;