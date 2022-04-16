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
            AND category = "${category};
          `;
      break;

    case hasCategoryProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND category = "${category};
          `;
      break;

    case hasCategoryAndPriorityProperty(request.query):
      getTodosQuery = `
            SELECT *
            FROM todo
            WHERE todo LIKE "%${search_q}%"
            AND category = "${category}"
            AND priority = "${priority};
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
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId};
    `;

  let todo = await db.get(getTodoQuery);
  response.send(todo);
});

app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  let getDuedateQuery = `
    SELECT *
    FROM todo
    WHERE due_date = "${date}";
  `;

  let todo = await db.all(getDuedateQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;
});
