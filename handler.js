const express = require("express");
const serverless = require("serverless-http");
const authRouter = require("./routes/auth")
const notesRouter = require("./routes/notes")
const app = express();

app.use(express.json());

app.use('/auth',authRouter);
app.use('/notes',notesRouter);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
