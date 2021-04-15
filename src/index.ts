import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";

const startServer = async () => {
  const app = express();
  const apolloServer = new ApolloServer({});
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
  apolloServer.applyMiddleware({ app });

  app.get("/", (_req, res) => res.send("hello"));

  app.listen(4000, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    );
  });
};

startServer();
