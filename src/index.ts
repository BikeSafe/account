import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/account.routes";

const startServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(userRoutes);
  let retries = 5;
  while (retries) {
    try {
      await createConnection();
      break;
    } catch (error) {
      console.log(error);
      retries--;
      console.log(`intentos faltantes ${retries}`);
      //esperar 5 segundos
      await new Promise((res) => setTimeout(res, 50000));
    }
  }
  app.get("/", (_req, res) => res.send("hello"));

  app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000`);
  });
};

startServer();
