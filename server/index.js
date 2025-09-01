const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const { TODOS } = require('./todo')
const { USERS } = require('./user')

async function startServer() {
    const app = express();

    const server = new ApolloServer({
        typeDefs: `
        type Users {
            id: ID!
            name: String!
            email: String!
            phone: String!
            website: String!
        }

      type Todos {
        id: ID!
        title: String!
        completed: Boolean
        user: Users
      }
        
      type Query {
        getTodos: [Todos]
        getAllUsers: [Users]
        getUser(id: ID!): Users
        getUsersByIds(ids: [ID!]!): [Users!]!
      }

      input CreateUserInput {
            name: String!,
            email: String!,
            phone: String!,
            website: String!
      }

      type Mutation {
      createUser(input: CreateUserInput): Users
      updateUser(id: ID!, name: String, email: String, phone: String, website: String): Users
      deleteUser(id: ID!): String
    }
    `,
        resolvers: {
            Todos: {
                user: (user) => USERS.find((e) => e.id === user.id)
            },
            Query: {
                getTodos: () => TODOS,
                getAllUsers: () => USERS,
                getUser: async (parent, { id }) => {
                    const userId = Number(id);
                    return USERS.find(user => user.id === userId);
                },
                getUsersByIds: (parent, { ids }) => {
                    const userIds = ids.map(id => Number(id));
                    return USERS.filter(user => userIds.includes(user.id));
                }
            },
            Mutation: {
                createUser: async (parent, { input }) => { // Destructure 'input' from the arguments
                    // Find the highest existing user ID and create a new one
                    const maxId = Math.max(...USERS.map(user => user.id));
                    const newUser = { id: maxId + 1, ...input }; // Spread the 'input' object
                    USERS.push(newUser);
                    return newUser;
                },
                updateUser: async (parent, { id, ...rest }) => {
                    const userId = Number(id);
                    const userIndex = USERS.findIndex(user => user.id === userId);
                    if (userIndex === -1) {
                        return null; // User not found
                    }
                    // Create the updated user object by merging existing data with new data
                    const updatedUser = { ...USERS[userIndex], ...rest };
                    USERS[userIndex] = updatedUser;
                    return updatedUser;
                },
                deleteUser: async (parent, { id }) => {
                    const userId = Number(id);
                    const userIndex = USERS.findIndex(user => user.id === userId);
                    if (userIndex === -1) {
                        return `User with id ${id} not found`;
                    }
                    // Remove the user from the USERS array
                    USERS.splice(userIndex, 1);
                    return `User with id ${id} deleted`;
                }
            },
        }
    });

    await server.start();

    app.use(bodyParser.json());
    app.use(cors());

    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }));

    app.listen(8000, () => {
        console.log('🚀 Server started at http://localhost:8000/graphql');
    });
}

startServer();
