import { ApolloServer, gql } from "apollo-server-lambda";
import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

// GraphQL Schema
const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
  }

  type Query {
    listBooks: [Book!]!
    getBook(id: ID!): Book
  }

  type Mutation {
    addBook(id: ID!, title: String!, author: String!): Book
    deleteBook(id: ID!): Boolean
  }
`;

// Resolver
const resolvers = {
  Query: {
    listBooks: async () => {
      const result = await client.send(new ScanCommand({ TableName: "BooksTable" }));
      return result.Items?.map((item) => ({
        id: item.id.S,
        title: item.title.S,
        author: item.author.S
      })) || [];
    },
    getBook: async (_: any, { id }: { id: string }) => {
      const result = await client.send(new GetItemCommand({
        TableName: "BooksTable",
        Key: { id: { S: id } }
      }));
      if (!result.Item) return null;
      return {
        id: result.Item.id.S,
        title: result.Item.title.S,
        author: result.Item.author.S
      };
    }
  },
  Mutation: {
    addBook: async (_: any, { id, title, author }: { id: string, title: string, author: string }) => {
      await client.send(new PutItemCommand({
        TableName: "BooksTable",
        Item: {
          id: { S: id },
          title: { S: title },
          author: { S: author }
        }
      }));
      return { id, title, author };
    },
    deleteBook: async (_: any, { id }: { id: string }) => {
      await client.send(new DeleteItemCommand({
        TableName: "BooksTable",
        Key: { id: { S: id } }
      }));
      return true;
    }
  }
};

// Server starten
const server = new ApolloServer({ typeDefs, resolvers });
export const graphqlHandler = server.createHandler();
