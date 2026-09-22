import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

const ensureCloudinaryConfig = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        dotenv.config({ path: "./src/.env" });
    }
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};
ensureCloudinaryConfig();

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        ensureCloudinaryConfig();
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
            console.log("Cloudinary env missing:", process.env.CLOUDINARY_CLOUD_NAME ? "cloud_name ok" : "cloud_name missing");
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded on Cloudinary. File src: " + response.url);
        // once the file is uploaded we are deleting it from the server
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("Cloudinary upload error:", error?.message || error);
        if (localFilePath && fs.existsSync(localFilePath)) {
            try { fs.unlinkSync(localFilePath); } catch {}
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return null;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from cloudinary", publicId);
        return result;
    } catch (error) {
        console.log("Error deleting from cloudinary", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
