const nodemailer = require('nodemailer');
const userModel=require('../model/user')
// Create a transporter object using SMTP


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mehrapawan070@gmail.com',
        pass: 'Nature@123456789'
    }
});

const updateUserPassword = async (req,res) => {
    try {
        const id=req.params.id
        // Find the user by their unique identifier
        const user = await userModel.findById(id);

        if (!user) {
            // Handle case where user is not found
            return { success: false, message: "User not found" };
        }

        // Update the password field with the new password
        user.password = newPassword;

        // Save the user, triggering the pre-save middleware to hash the new password
        await user.save();

        // Send email notification
        await transporter.sendMail({
            from: 'mehrapawan070@gmail.com',
            to: user.email,
            subject: 'Password Updated',
            text: 'Your password has been updated successfully.'
        });

        return { success: true, message: "Password updated successfully" };
    } catch (error) {
        // Handle any errors that occur during the update process
        console.error("Error updating password:", error);
        return { success: false, message: "Internal server error" };
    }
};
