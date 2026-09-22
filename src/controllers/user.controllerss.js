import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/users.models.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    // accept both `fullname` and `fullName` (client often sends camelCase)
    const { fullname: _fullname, fullName, email, username, password } = req.body;
    const fullname = _fullname || fullName;

    // validation - show which field is missing for easier debugging
    if (
        [fullname, email, username, password].some(
            (field) => !field?.trim(),
        )
    ) {
        console.log("registerUser: req.body =", req.body, "req.files =", req.files);
        throw new ApiError(400, `All fields are required. Received: fullname=${fullname}, email=${email}, username=${username}, password=${password ? "***" : password}`);
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with same username or email exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing.");
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // let coverImage = "";
    // if (coverLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverImage);
    // }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar?.url) throw new Error("Cloudinary avatar upload failed");
        console.log("Uploaded Avatar", avatar);
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "Failed to upload avatar");
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath);
        console.log("Uploaded cover image", coverImage);
    } catch (error) {
        console.log("Error uploading coverImage", error);
        throw new ApiError(500, "Failed to upload coverImage");
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken",
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong!");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdUser,
                    "User registered successfully",
                ),
            );
    } catch (error) {
        console.log("User creation failed:", error);

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }

        // preserve original error for debugging (shows validation/duplicate/DB errors)
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            500,
            error?.message || "Something went wrong while registering a user & images were deleted",
        );
    }
});

export { registerUser };
