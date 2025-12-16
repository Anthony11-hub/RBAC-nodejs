import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { utils } from "./utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import postsRouter from "./routes/post.router";
import authRoutes from "./routes/auth.router";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

// routes
app.get(
  "/health",
  utils.tryCatchBlock(async (req, res) => {
    await utils.healthCheck();
    return res.status(200).send({
      message: "Health check endpoint success.",
    });
  }),
);
// posts
app.use("/api/v1/post", postsRouter);
// auth
app.use("/api/v1/auth", authRoutes);
// user

// errorHandler
app.use(errorHandler as unknown as express.ErrorRequestHandler);

export default app;
