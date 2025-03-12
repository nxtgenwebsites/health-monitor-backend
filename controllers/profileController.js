import userModel from '../models/userModel.js'

export const userPersonalDetails = async (req, res) => {
    try {
        const {userId} = req.params;
        const { title, name, middle_name, last_name, gender, nationality, marital_status, dob, relationship, contact_no, education_level, employment_status } = req.body;

        let user = await userModel.findById(userId).select('-password');


        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        user.title = title;
        user.name = name;
        user.middle_name = middle_name;
        user.last_name = last_name;
        user.gender = gender;
        user.nationality = nationality;
        user.marital_status = marital_status;
        user.dob = dob;
        user.relationship = relationship;
        user.contact_no = contact_no;
        user.education_level = education_level;
        user.employment_status = employment_status;

        await user.save();
        res.status(200).json({ message: "User profile updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const residentialDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const { country , state, city, town, address } = req.body;

        let user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        user.country = country;
        user.state = state;
        user.city = city;
        user.town = town;
        user.address = address;

        // Updating user address details
        
        await user.save();
        res.status(200).json({ message: "User address updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const childrenDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const { children_no, children_number, children_gender, children_dob } = req.body;
        let user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

       user.children_no = children_no;
        user.children_number = children_number;
        user.children_gender = children_gender;
        user.children_dob = children_dob;

        await user.save();
        res.status(200).json({ message: "User children details updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const profileNotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const { notes } = req.body;

        let user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Updating user notes
        user.notes = notes;

        await user.save();
        res.status(200).json({ message: "User notes saved successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};

export const addNextOfKin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { kin_name, kin_relationship, kin_gender, kin_email, kin_contact_no } = req.body;

        let user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Creating a new kin entry
        const newKin = {
            kin_name,
            kin_relationship,
            kin_gender,
            kin_email,
            kin_contact_no,
        };

        // Adding the new kin to the user's next_of_kin array
        user.next_of_kin.push(newKin);

        await user.save();
        res.status(200).json({ message: "Next of kin added successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};