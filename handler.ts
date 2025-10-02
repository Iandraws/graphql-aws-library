import { ApolloServer } from "apollo-server-lambda";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

const server = new ApolloServer({ typeDefs, resolvers });
export const graphqlHandler = server.createHandler();
