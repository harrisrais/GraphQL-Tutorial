import { useQuery, gql } from '@apollo/client';

const GET_TODOS = gql`
  query GetTodos {
    getTodos {
      id
      title
      completed
      user {
        name
      }
    }
  }
`;

const GET_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      name
      email
      phone
      website
      address{
        street
        city
      }
    }
  }
`;

function App() {
  const { data: todoData, loading: todoLoading } = useQuery(GET_TODOS);
  const { data: userData, loading: userLoading } = useQuery(GET_USERS);


  if (todoLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div >
      <div className="App">
        <h1>Todos List</h1>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Id#</th>
              <th>Todo title</th>
              <th>Written By</th>
            </tr>
          </thead>
          <tbody>
            {todoData.getTodos.map((todo) => (
              <tr key={todo.id} className="hover:bg-gray-50 text-gray-600">
                <td>{todo.id}</td>
                <td>{todo.title}</td>
                <td>{todo?.user?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <div className="App">
        <h1>Users List</h1>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Id#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Website</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {userData.getAllUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 text-gray-600">
                <td className="p-4 border-b border-gray-200 text-center">{user.id}</td>
                <td
                  className="p-4 border-b border-gray-200 text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.website}</td>
                <td>{user.address.street}, {user.address.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
