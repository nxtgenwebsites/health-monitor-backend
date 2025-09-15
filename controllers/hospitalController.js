import csv from "csv-parser";
import Hospital from "../models/hospitalModel.js";
import multer from "multer";
import { Readable } from "stream";
import fetch from "node-fetch";
import xlsx from "xlsx"; // Excel parser
// Memory storage (file save nahi hogi)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File required (CSV or Excel)" });
        }

        const results = [];
        const fileBuffer = req.file.buffer;

        let rows = [];

        if (req.file.originalname.endsWith(".xlsx")) {
            // ✅ Excel file parse
            const workbook = xlsx.read(fileBuffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
            // ✅ CSV file parse
            rows = await new Promise((resolve, reject) => {
                const temp = [];
                const stream = Readable.from(fileBuffer.toString());

                stream
                    .pipe(csv())
                    .on("data", (row) => temp.push(row))
                    .on("end", () => resolve(temp))
                    .on("error", (err) => reject(err));
            });
        }

        // ✅ Clean & save rows
        rows.forEach((row) => {
            const lat = parseFloat(row.Latitude);
            const lon = parseFloat(row.Longitude);

            if (!isNaN(lat) && !isNaN(lon)) {
                results.push({
                    country: row.Country || "",
                    state: row.State || "",
                    lga_region: row["LGA/Region"] || "",
                    town: row.Town || "",
                    city: row.City || "",
                    neighbourhood: row.Neighbourhood || "",
                    facility_name: row.Facility_Name || "",
                    address: row.Address || "",
                    hours: row.Hours || "",
                    phone_number: row.PhoneNumber || "",
                    website: row.Website || "",
                    contact_name: row.Contact_Name || "",
                    services: row.Services || "",
                    place_id: row.PlaceID || "",
                    source: row.Source || "",
                    location: {
                        type: "Point",
                        coordinates: [lon, lat],
                    },
                });
            }
        });

        if (results.length === 0) {
            return res.status(400).json({ message: "No valid rows found (lat/lon missing)" });
        }

        await Hospital.insertMany(results);

        res.status(200).json({
            message: "Data uploaded successfully",
            count: results.length,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error uploading file",
            error: err.message,
        });
    }
};

// ✅ Get hospitals in user’s country (auto-detect from lat/lon)
export const getNearbyHospitals = async (req, res) => {
    try {
        const { latitude, longitude, page = 1, limit = 20 } = req.query;

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

        // ✅ Pagination calculation
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // ✅ Total hospitals in that country
        const totalHospitals = await Hospital.countDocuments({ country: userCountry });

        // ✅ GeoNear aggregation (distance + country filter + pagination)
        const hospitals = await Hospital.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    distanceField: "distance", // distance in meters
                    spherical: true,
                    query: { country: userCountry }, // ✅ only this country
                },
            },
            { $skip: skip },
            { $limit: parseInt(limit) },
        ]);

        if (!hospitals.length) {
            return res.json({
                message: `No hospitals found in ${userCountry} for this page`,
                country: userCountry,
                totalHospitals,
                page: parseInt(page),
                totalPages: Math.ceil(totalHospitals / limit),
                hospitals: [],
            });
        }

        res.json({
            country: userCountry,
            totalHospitals,
            page: parseInt(page),
            totalPages: Math.ceil(totalHospitals / limit),
            hospitals,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching hospitals",
            error: err.message,
        });
    }
};

// ✅ Find hospitals by filters (country required)
export const findHospitalsBySearch = async (req, res) => {
    try {
        let { country, state, city, service } = req.body;
        const { page = 1, limit = 20 } = req.query;

        // ✅ Country required
        if (!country || country.trim() === "") {
            return res.status(400).json({
                message: "Country is required",
            });
        }

        // ✅ Convert all to lowercase safely
        country = country.trim().toLowerCase();
        if (state) state = state.trim().toLowerCase();
        if (city) city = city.trim().toLowerCase();
        if (service) service = service.trim().toLowerCase();

        // ✅ Build filters (only non-empty fields)
        const filters = {};
        if (country) filters.country = new RegExp(`^${country}$`, "i"); // exact match, case-insensitive
        if (state && state !== "") filters.state = new RegExp(`^${state}$`, "i");
        if (city && city !== "") filters.city = new RegExp(`^${city}$`, "i");
        if (service && service !== "") filters.services = new RegExp(service, "i"); // partial match

        // ✅ Pagination calculation
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // ✅ Count total
        const totalHospitals = await Hospital.countDocuments(filters);

        // ✅ Fetch hospitals with pagination
        const hospitals = await Hospital.find(filters)
            .skip(skip)
            .limit(parseInt(limit));

        // ✅ Response
        res.json({
            filters,
            totalHospitals,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalHospitals / limit),
            hospitals,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching hospitals",
            error: err.message,
        });
    }
};
  