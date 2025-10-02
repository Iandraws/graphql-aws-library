import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

// DynamoDB Local Client (mit Dummy-Credentials)
const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "dummy",
    secretAccessKey: "dummy"
  }
});

export const resolvers = {
  Query: {
    listBooks: async () => {
      try {
        const result = await client.send(
          new ScanCommand({ TableName: "BooksTable" })
        );

        return (
          result.Items?.map((item) => ({
            id: item.id.S,
            title: item.title.S,
            author: item.author.S
          })) || []
        );
      } catch (err) {
        console.error("Error in listBooks:", err);
        return [];
      }
    },

    getBook: async (_: any, { id }: { id: string }) => {
      try {
        const result = await client.send(
          new GetItemCommand({
            TableName: "BooksTable",
            Key: { id: { S: id } }
          })
        );
        if (!result.Item) return null;
        return {
          id: result.Item.id.S,
          title: result.Item.title.S,
          author: result.Item.author.S
        };
      } catch (err) {
        console.error("Error in getBook:", err);
        return null;
      }
    }
  },

  Mutation: {
    addBook: async (_: any, { title, author }: { title: string; author: string }) => {
      const id = uuidv4();
      try {
        await client.send(
          new PutItemCommand({
            TableName: "BooksTable",
            Item: {
              id: { S: id },
              title: { S: title },
              author: { S: author }
            }
          })
        );
        return { id, title, author };
      } catch (err) {
        console.error("Error in addBook:", err);
        throw err;
      }
    },

    updateBook: async (_: any, { id, title, author }: { id: string; title?: string; author?: string }) => {
      let updateExpression = "set";
      const expressionValues: Record<string, any> = {};
      if (title) {
        updateExpression += " title = :title,";
        expressionValues[":title"] = { S: title };
      }
      if (author) {
        updateExpression += " author = :author,";
        expressionValues[":author"] = { S: author };
      }
      updateExpression = updateExpression.slice(0, -1);

      try {
        const updated = await client.send(
          new UpdateItemCommand({
            TableName: "BooksTable",
            Key: { id: { S: id } },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionValues,
            ReturnValues: "ALL_NEW"
          })
        );

        return {
          id: updated.Attributes?.id.S,
          title: updated.Attributes?.title.S,
          author: updated.Attributes?.author.S
        };
      } catch (err) {
        console.error("Error in updateBook:", err);
        throw err;
      }
    },

    deleteBook: async (_: any, { id }: { id: string }) => {
      try {
        await client.send(
          new DeleteItemCommand({
            TableName: "BooksTable",
            Key: { id: { S: id } }
          })
        );
        return true;
      } catch (err) {
        console.error("Error in deleteBook:", err);
        return false;
      }
    }
  }
};
