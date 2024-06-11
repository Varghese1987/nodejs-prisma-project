import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
