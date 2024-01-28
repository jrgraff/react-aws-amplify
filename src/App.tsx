import './App.css';
import { createTodo, deleteTodo} from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { withAuthenticator, Button, Text, Flex, Heading } from "@aws-amplify/ui-react";
import { useCallback, useEffect, useState } from 'react';
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import awsconfig from "./amplifyconfiguration.json";

Amplify.configure(awsconfig);

const API = generateClient();

function App({ signOut }: {signOut?: () => void}) {
  const [ todos, setTodos ] = useState<{id: string,name: string}[]>([])

  const fetchtodos = useCallback(async () => {
    const result = await API.graphql({
      query: listTodos,
    })
    const todosFromAPI = result.data.listTodos.items;
    setTodos(todosFromAPI);
  }, [setTodos])

  const handleCreateTodo = useCallback(async () => {
    await API.graphql({
      query: createTodo,
      variables: { input: { name: window.prompt("New note") ?? '' } }
    })
    fetchtodos()
  }, [fetchtodos])

  const handleDeleteTodo = useCallback(async (id: string) => {
    await API.graphql({
      query: deleteTodo,
      variables: { input: { id: id } }
    })
    fetchtodos()
  }, [fetchtodos])

  useEffect(() => {
    fetchtodos()
  }, [fetchtodos])

  return (
    <Flex direction={"column"}>
      <Flex justifyContent={'space-between'}>
        <Heading level={1}>My todos</Heading>
        <Button onClick={signOut}>Sign Out</Button>
      </Flex>
      {todos.map(note => <Flex alignItems={'center'}>
        <Text>{note.name}</Text>
        <Button onClick={() => handleDeleteTodo(note.id)}>Remove</Button>
      </Flex>)}
      <Button onClick={handleCreateTodo}>Add Note</Button>
    </Flex>
  );
}

export default withAuthenticator(App);