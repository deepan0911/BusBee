const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createOperator = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        const email = "operator@busbee.com";
        const password = "operator123";
        const name = "Test Operator";

        // Check if operator already exists
        let operator = await User.findOne({ email });

        if (operator) {
            console.log("Operator already exists. Updating role to 'operator' just in case.");
            operator.role = "operator";
            await operator.save();
            console.log("Operator updated.");
        } else {
            operator = new User({
                name,
                email,
                password,
                role: "operator",
                phone: "1234567890"
            });
            await operator.save();
            console.log("Operator created.");
        }

        console.log("Email:", email);
        console.log("Password:", password);
        process.exit(0);
    } catch (error) {
        console.error("Error creating operator:", error);
        process.exit(1);
    }
};

createOperator();
