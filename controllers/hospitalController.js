import csv from "csv-parser";
import Hospital from "../models/hospitalModel.js";
import multer from "multer";
import { Readable } from "stream";

// Memory storage (file save nahi hogi)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Upload CSV aur DB me save
export const uploadCSV = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "CSV file required" });

        const results = [];
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on("data", (row) => {
                const lat = parseFloat(row.latitude);
                const lon = parseFloat(row.longitude);

                // ✅ Only push rows with valid coordinates
                if (!isNaN(lat) && !isNaN(lon)) {
                    results.push({
                        name: row.name,
                        type: row.type,
                        country: row.country,
                        state: row.state,
                        city: row.city,
                        number: row.number,
                        location: {
                            type: "Point",
                            coordinates: [lon, lat]  // GeoJSON format: [longitude, latitude]
                        }
                    });
                }
            })
            .on("end", async () => {
                if (results.length === 0) {
                    return res.status(400).json({ message: "No valid rows found in CSV" });
                }

                await Hospital.insertMany(results);
                res.status(200).json({ message: "CSV data uploaded successfully", count: results.length });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error uploading CSV", error: err.message });
    }
  };

// Get hospitals near user
export const getNearbyHospitals = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "latitude and longitude required" });
        }

        // 50 miles to meters (1 mile ≈ 1609.34 meters)
        const distance = 50 * 1609.34;

        const hospitals = await Hospital.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: distance
                }
            }
        });

        if (!hospitals.length) {
            return res.json({ message: "No hospitals found within 50 miles of your location" });
        }

        res.json({ count: hospitals.length, hospitals });
    } catch (err) {
        res.status(500).json({ message: "Error fetching nearby hospitals", error: err.message });
    }
};
  