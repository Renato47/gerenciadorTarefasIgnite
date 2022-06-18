const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user)
    return response.status(404).json({ error: "user not found" });

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists)
    return response.status(400).json({ error: "user already exists" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  request.user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = request.user.todos.find(todo => todo.id === id);

  if (!todo)
    return response.status(404).json({ error: "todo not found" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo = request.user.todos.find(todo => todo.id === id);

  if (!todo)
    return response.status(404).json({ error: "todo not found" });

  todo.done = true;

  response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoIndex = request.user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1)
    return response.status(404).send({ error: "todo not found" });

  request.user.todos.splice(todoIndex, 1);

  response.status(204).json();
});

module.exports = app;