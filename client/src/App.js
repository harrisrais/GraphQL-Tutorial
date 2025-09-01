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

function App() {
  const { data, loading } = useQuery(GET_TODOS);
  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="App">
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Id#</th>
            <th>Todo title</th>
            <th>Written By</th>
          </tr>
        </thead>
        <tbody>
          {data.getTodos.map((todo) => (
            <tr key={todo.id}>
              <td>{todo.id}</td>
              <td>{todo.title}</td>
              <td>{todo?.user?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
