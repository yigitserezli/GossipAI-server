import express from "express";
import apiRouter from "./routes";
import { AppError } from "./shared/errors/app-error";
import { errorHandler } from "./shared/middlewares/error-handler";

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use("/api", apiRouter);

app.use((_req, _res, next) => {
  next(new AppError("The requested endpoint does not exist.", 404, undefined, "ROUTE_NOT_FOUND"));
});

app.use(errorHandler);

export default app;
