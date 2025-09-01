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

      type Mutation {
      createUser(name: String!, email: String!, phone: String!, website: String!): Users
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
                getUser: (parent, { id }) => {
                    // The GraphQL 'ID' type is passed as a string.
                    // Convert it to a number to match the type in your USERS array.
                    const userId = Number(id);
                    return USERS.find(user => user.id === userId);
                },
                 getUsersByIds: (parent, { ids }) => {
                    const userIds = ids.map(id => Number(id));
                    return USERS.filter(user => userIds.includes(user.id));
                }
            },
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
            },
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
