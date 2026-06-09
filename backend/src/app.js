import express from "express";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Blog API Running 🚀");
});


app.use("/api/upload", uploadRoutes);

export default app;