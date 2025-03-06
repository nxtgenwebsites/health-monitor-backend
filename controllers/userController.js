import userModel from "../models/userModel.js";

// Get all users(Admin only)
export const getAllUser = async (req, res) => {
    try {
        const { id } = req.headers;

        // Check admin access  
        const findUser = await userModel.findById(id);
        
        if (findUser.role !== 'super admin') {
            return res.status(403).json({ message: "Only admins can perform this action." });
        }

        const allUsers = await userModel.find({});

        return   res.status(200).json({
            message: "All users retrieved successfully.",
            data: allUsers
        });


    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

// Get one user (Accessible to everyone)
export const getOneUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            message: "User retrieved successfully.",
            data: user
        });

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.headers; 
        const { userId } = req.params; 

        // Verify if the requester is a super admin
        const requester = await userModel.findById(id);

        if (requester.role !== "super admin") {
            return res.status(403).json({ message: "Only super admins can delete users." });
        }

        // Fetch the user to be deleted
        const userToDelete = await userModel.findById(userId);

        // Prevent deletion of admins
        if (userToDelete.role === "super admin") {
            return res.status(403).json({ message: "Cannot delete another super admin." });
        }

        // Delete user
        await userModel.findByIdAndDelete(userId);

        return res.status(200).json({ message: "User deleted successfully." });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Block user (Admin only)
export const blockUser = async (req, res) => {
    try {
        const { id } = req.headers; 
        const { userId } = req.params;

        // Check if the requester is a super admin
        const admin = await userModel.findById(id);

        if (admin.role !== "super admin") {
            return res.status(403).json({ message: "Only super admins can block users." });
        }

        // Fetch the user to be blocked
        const userToBlock = await userModel.findById(userId);
        if (!userToBlock) {
            return res.status(404).json({ message: "User not found." });
        }

        // Prevent blocking a super admin
        if (userToBlock.role === "super admin") {
            return res.status(403).json({ message: "Cannot block a super admin." });
        }

        // Check if the user is already blocked
        if (userToBlock.isBlocked) {
            return res.status(400).json({ message: "User is already blocked." });
        }

        // Block the user
        userToBlock.isBlocked = true;
        await userToBlock.save();

        res.status(200).json({ message: "User blocked successfully.", data: userToBlock });

    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Unblock user (Admin only)
export const unblockUser = async (req, res) => {
    try {
        const { id } = req.headers;
        const { userId } = req.params;

        // Check if the requester is a super admin
        const admin = await userModel.findById(id);
        if ( admin.role !== "super admin") {
            return res.status(403).json({ message: "Only super admins can unblock users." });
        }

        // Fetch the user to be unblocked
        const userToUnblock = await userModel.findById(userId);
        if (!userToUnblock) {
            return res.status(404).json({ message: "User not found." });
        }

        // Prevent unblocking a super admin (not needed but for safety)
        if (userToUnblock.role === "super admin") {
            return res.status(403).json({ message: "Cannot modify a super admin." });
        }

        // Check if the user is already unblocked
        if (!userToUnblock.isBlocked) {
            return res.status(400).json({ message: "User is not blocked." });
        }

        // Unblock the user
        userToUnblock.isBlocked = false;
        await userToUnblock.save();

        res.status(200).json({ message: "User unblocked successfully.", data: userToUnblock });

    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Edit user (Admin only)
export const editUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { id } = req.headers;
        const { name, middle_name, last_name, role, password } = req.body;

        // Check if the requesting user is an admin
        const adminUser = await userModel.findById(id);

        console.log(id);
        console.log(adminUser.role);

        if (adminUser.role !== 'super admin') {
            return res.status(403).json({ message: "Only super admins can edit users." });
        }

        // Find user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        // Update allowed fields
        if (name) user.name = name;
        if (middle_name) user.middle_name = middle_name;
        if (last_name) user.last_name = last_name;
        if (role) user.role = role;

        // Hash new password if provided
        if (password) {
            const saltRounds = 10;
            user.password = await bcrypt.hash(password, saltRounds);
        }

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);
    }
};