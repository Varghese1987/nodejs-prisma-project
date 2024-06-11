import express from "express";
import prisma from "../db.js";
import { identifyUser } from "./service.js";

const router = express.Router();

router.post("/identify", async (req, res) => {
  const { status, data } = await identifyUser(req.body);

  res.status(status).json(data);
});

export default router;
