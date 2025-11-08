const express = require("express");
const jwt = require("jsonwebtoken");
const docClient = require('../db/db')

const USERS_TABLE = process.env.USERS_TABLE;

const { 
        GetCommand, 
        PutCommand,
      } = require("@aws-sdk/lib-dynamodb");

const app = express();

app.post('/signup', async (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password required" });
  }

  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { username } 
    }));

    if (Item) {
      return res.status(400).json({ msg: "User already exists" });
    }

    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        username,
        password
      }
    }));

    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    return res.json({ msg: "User Signed Up", token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: e.message });
  }
});

app.post('/signin', async (req,res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password required" });
  }

  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { username } 
    }));

    if (!Item) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }

    if(Item.username!==username || Item.password!==password)
    {
      return res.status(400).json({msg:"Invalid Username Or Password"});
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    return res.json({ msg: "User Signed In", token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: e.message });
  }

});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports = app;