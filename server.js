import "dotenv/config";
import app from "./src/app.js";
import { connectSnowflake } from "./src/config/snowflake.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectSnowflake();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
