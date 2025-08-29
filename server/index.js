const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

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
      }

      type Mutation {
      createUser(name: String!, email: String!, phone: String!, website: String!): Users
      updateUser(id: ID!, name: String, email: String, phone: String, website: String): Users
      deleteUser(id: ID!): String
    }
    `,
        resolvers: {
            Todos: {
                user: async (todo) => {
                    const res = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.id}`)
                    return res.data
                }
            },
            Query: {
                getTodos: async () => {
                    const res = await axios.get('https://jsonplaceholder.typicode.com/todos');
                    return res.data.slice(0, 5);
                },
                getAllUsers: async () => {
                    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
                    return res.data.slice(0, 5);
                },
                getUser: async (parent, { id }) => {
                    const res = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)
                    return res.data
                }
            },
            Mutation: {
                createUser: async (parent, args) => {
                    const res = await axios.post('https://jsonplaceholder.typicode.com/users', args);
                    return res.data;
                },
                updateUser: async (parent, { id, ...rest }) => {
                    const res = await axios.put(`https://jsonplaceholder.typicode.com/users/${id}`, rest);
                    return res.data;
                },
                deleteUser: async (parent, { id }) => {
                    await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
                    return `User with id ${id} deleted`;
                }
            }
        },
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
