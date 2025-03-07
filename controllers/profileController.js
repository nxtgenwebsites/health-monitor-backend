import userModel from '../models/userModel.js'

export const userPersonalDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const { title, username, name, email, password, middle_name, last_name, gender, nationality, marital_status, dob, relationship, contact_no, education_level, employment_status } = req.body;

        let user = await userModel.findOne({ _id: userId });

        user.title = title;
        user.username = username;
        user.name = name;
        user.middle_name = middle_name;
        user.last_name = last_name;
        user.email = email;
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
        res.status(500).json({ message: "Server error", error });
    }
};
