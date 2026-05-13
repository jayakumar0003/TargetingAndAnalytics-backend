import "dotenv/config";
import app from "./src/app.js";
import { connectSnowflake } from "./src/config/snowflake.js";

const PORT = process.env.PORT || 3000;

try {
  await connectSnowflake();
  console.log("✅ Snowflake connected");

  // Only run local server outside Vercel
  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
} catch (error) {
  console.error("❌ Failed to start server:", error);
}

export default app;