let express = require("express");
let path = require("path");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let getDate = require("date-fns");

let app = express();
app.use(express.json());

module.exports = app;

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Running Server Successfully..!!!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

let convertToResponseObj = (data) => {
  resultArray = [];
  let obj = {};
  for (let item of data) {
    obj = {
      id: item.id,
      todo: item.todo,
      priority: item.priority,
      status: item.status,
      category: item.category,
      dueDate: item.due_date,
    };
    resultArray.push(obj);
  }
  return resultArray;
};

let hasStatusAndPriorityStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

let hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

let hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

let hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

let hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

let hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

let updateStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

let updateTodo = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

let updateCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

let updateDuedate = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

let updatePriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

//API-1
app.get("/todos/", async (request, response) => {
  let { status, priority, search_q = "", category } = request.query;
  let data = null;
  let getTodosQuery = "";

  switch (true) {
    case hasStatusAndPriorityStatus(request.query):
      getTodosQuery = `
                SELECT *
                FROM todo
                WHERE todo LIKE "%${search_q}%"
                AND status = "${status}"
                AND priority = "${priority}";
            `;
      break;

    case hasStatusProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND status = "${status}";
          `;
      break;

    case hasPriorityProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND priority = "${priority}";
          `;
      break;

    case hasCategoryAndStatusProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND status = "${status}"
            AND category = "${category}";
          `;
      break;

    case hasCategoryProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND category = "${category}";
          `;
      break;

    case hasCategoryAndPriorityProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND category = "${category}"
            AND priority = "${priority}";
          `;
      break;

    default:
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%";
          `;
  }
  data = await db.all(getTodosQuery);
  response.send(convertToResponseObj(data));
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;

  let todo = await db.all(getTodoQuery);
  response.send(convertToResponseObj(todo)[0]);
});

//API-3
app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  let getDuedateQuery = `
    SELECT *
    FROM todo
    WHERE due_date = "${date}";
  `;

  let todo = await db.all(getDuedateQuery);
  response.send(convertToResponseObj(todo));
});

//API-4
app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;
  let addTodoQuery = `
    INSERT INTO todo
    (id, todo, priority, status, category, due_date)
    VALUES (${id}, "${todo}", "${priority}", "${status}", "${category}", "${dueDate}");
  `;

  db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API-5
app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { status, todo, category, priority, dueDate } = request.body;
  let updateTodoQuery = "";
  switch (true) {
    case updateStatus(request.body):
      updateTodoQuery = `
    UPDATE todo
    SET status = "${status}"
    WHERE id = ${todoId};
  `;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
      break;

    case updatePriority(request.body):
      updateTodoQuery = `
    UPDATE todo
    SET priority = "${priority}"
    WHERE id = ${todoId};
  `;
      await db.run(updateTodoQuery);
      response.send("Priority Updated");
      break;

    case updateTodo(request.body):
      updateTodoQuery = `
    UPDATE todo
    SET todo = "${todo}"
    WHERE id = ${todoId};
  `;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    case updateCategory(request.body):
      updateTodoQuery = `
    UPDATE todo
    SET category = "${category}"
    WHERE id = ${todoId};
  `;
      await db.run(updateTodoQuery);
      response.send("Status Updated");
      break;

    case updateDuedate(request.body):
      updateTodoQuery = `
    UPDATE todo
    SET due_date = "${dueDate}"
    WHERE id = ${todoId};
  `;
      await db.run(updateTodoQuery);
      response.send("Due Date Updated");
      break;
  }
});

//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let deleteTodoQuery = `
    DELETE todo
    WHERE id = ${todoId}
  `;

  db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
