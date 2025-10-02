import { gql } from "apollo-server-lambda";

export const typeDefs = gql`
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
    addBook(title: String!, author: String!): Book
    updateBook(id: ID!, title: String, author: String): Book
    deleteBook(id: ID!): Boolean
  }
`;
