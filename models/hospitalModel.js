import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name: String,
    type: String,
    country: String,
    state: String,
    city: String,
    number: String,
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: true }
    }
});

// ✅ 2dsphere index for geospatial queries
hospitalSchema.index({ location: "2dsphere" });

export default mongoose.model("Hospital", hospitalSchema);
