import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./src/.env",
});

const PORT = process.env.PORT || 611;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening at Port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB Connection Error");
    });
