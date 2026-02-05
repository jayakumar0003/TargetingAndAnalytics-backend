import express from "express";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  
app.use(express.json());

app.use("/api/users", userRoutes);

export default app;
