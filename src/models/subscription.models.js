import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // who is sunscribing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // The channel that is getting a sub
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
