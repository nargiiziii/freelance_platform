import express from "express";
import "dotenv/config";
import "src/config/db.js";
import cors from "cors";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

// app.post("api/..", async (req, res) => {

// }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});