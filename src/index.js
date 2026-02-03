import connectDb from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js";

dotenv.config();
connectDb()
.then(() => {
     app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((error) => {
    console.log("Failed to start server due to database connection error", error);
})