const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const ensureDemoUser = require("./utils/ensureDemoUser");

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await ensureDemoUser();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
