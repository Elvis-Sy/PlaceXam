import express from "express";

const demoRouter = express.Router();

demoRouter.get("/", (req, res) => {
  res.json({ message: "Demo route" });
});

export default demoRouter;