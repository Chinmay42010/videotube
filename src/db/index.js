import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({
    path: "./src/.env",
});

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}`,
        );

        console.log(
            `\n MongoDB Connected ! DB Host: ${connectionInstance.connection.host}`,
        );
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
};

export default connectDB;
