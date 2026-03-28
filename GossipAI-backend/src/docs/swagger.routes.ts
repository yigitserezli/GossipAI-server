import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi";

const swaggerRouter = Router();

swaggerRouter.get("/openapi.json", (_req, res) => {
  res.status(200).json(openApiSpec);
});

swaggerRouter.use("/docs", swaggerUi.serve);
swaggerRouter.get(
  "/docs",
  swaggerUi.setup(openApiSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  })
);

export default swaggerRouter;
