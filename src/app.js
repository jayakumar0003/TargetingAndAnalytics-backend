import express from "express";
import targetingRoutes from "./routes/targeting.routes.js";
import radiaplanRouter from "./routes/radiaplan.routes.js";
import campaignRouter from "./routes/campaign.routes.js";
import mediaplanRouter from "./routes/mediaplan.routes.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "https://targetingandanalytics-frontend.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

  
app.use(express.json());

app.use("/api/targeting", targetingRoutes);
app.use("/api/campaign", campaignRouter);
app.use("/api/mediaplan", mediaplanRouter);
app.use("/api/radiaplan", radiaplanRouter);

export default app;