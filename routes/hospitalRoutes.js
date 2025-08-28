import express from "express";
import { getNearbyHospitals, upload, uploadCSV } from "../controllers/hospitalController.js";

const router = express.Router();

// Route for CSV upload
router.post("/upload-csv", upload.single("file"), uploadCSV);
// Nearby hospitals
router.get("/nearby", getNearbyHospitals);
export default router;
