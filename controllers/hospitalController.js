import csv from "csv-parser";
import Hospital from "../models/hospitalModel.js";
import multer from "multer";
import { Readable } from "stream";
import fetch from "node-fetch";
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
                const lat = parseFloat(row.Latitude);
                const lon = parseFloat(row.Longitude);

                // ✅ Only push rows with valid coordinates
                if (!isNaN(lat) && !isNaN(lon)) {
                    results.push({
                        country: row.Country,
                        state: row.State,
                        lga_region: row["LGA/Region"],
                        town: row.Town,
                        city: row.City,
                        neighbourhood: row.Neighbourhood,
                        facility_name: row.Facility_Name,
                        address: row.Address,
                        hours: row.Hours,
                        phone_number: row.PhoneNumber,
                        website: row.Website,
                        contact_name: row.Contact_Name,
                        services: row.Services,  // you can split by comma if needed
                        place_id: row.PlaceID,
                        source: row.Source,
                        location: {
                            type: "Point",
                            coordinates: [lon, lat] // GeoJSON format: [longitude, latitude]
                        }
                    });
                }
            })
            .on("end", async () => {
                if (results.length === 0) {
                    return res.status(400).json({ message: "No valid rows found in CSV" });
                }

                await Hospital.insertMany(results);
                res.status(200).json({
                    message: "CSV data uploaded successfully",
                    count: results.length
                });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error uploading CSV",
            error: err.message
        });
    }
};

// ✅ Get hospitals in user’s country (auto-detect from lat/lon)
export const getNearbyHospitals = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({
                message: "latitude and longitude required",
            });
        }

        let userCountry;

        // ✅ Reverse geocoding with proper User-Agent (important for Nominatim)
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
                {
                    headers: {
                        "User-Agent": "MyHospitalApp/1.0 (shahbazansari8199@gmail.com)",
                    },
                }
            );
              

            if (!geoRes.ok) {
                throw new Error("Unable to geocode (bad response)");
            }

            const geoData = await geoRes.json();

            userCountry = geoData?.address?.country;
            
        } catch (geoErr) {
            return res.status(400).json({
                message: "Unable to detect country from coordinates",
                error: geoErr.message,
            });
        }

        if (!userCountry) {
            return res.status(400).json({
                message: "Could not determine country from given coordinates",
            });
        }

        // ✅ Find hospitals in detected country
        const hospitals = await Hospital.find({ country: userCountry });

        if (!hospitals.length) {
            return res.json({ message: `No hospitals found in ${userCountry}` });
        }

        res.json({
            country: userCountry,
            count: hospitals.length,
            hospitals,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching hospitals",
            error: err.message,
        });
    }
};