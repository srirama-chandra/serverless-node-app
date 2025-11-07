const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { v4: uuid } = require('uuid'); 
const jwt = require("jsonwebtoken"); 
const { DynamoDBDocumentClient, 
        GetCommand, 
        PutCommand, 
        BatchGetCommand, 
        UpdateCommand, 
        DeleteCommand,
        QueryCommand 
      } = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");
const authMiddleware = require("./authMiddleware");

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
const NOTES_TABLE = process.env.NOTES_TABLE;
const NOTES_META_TABLE = process.env.NOTES_META_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

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

app.get('/notes', authMiddleware, async (req, res) => {
  const username = req.username;
  
  try {
    const noteResult = await docClient.send(new QueryCommand({
      TableName: process.env.NOTES_TABLE,
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username
      }
    }));
    
    const notes = noteResult.Items || [];

    if (notes.length === 0) {
      return res.json({notes:[]});
    }
    
    const noteIds = notes.map(note => ({ noteId: note.noteId }));

    const noteMetaResult = await docClient.send(new BatchGetCommand({
      RequestItems: {
        [process.env.NOTES_META_TABLE]: {
          Keys: noteIds
        }
      }
    }));

    const metaItems = noteMetaResult.Responses?.[process.env.NOTES_META_TABLE] || [];

    const metaMap = new Map(
      metaItems.map(metaItem => [metaItem.noteId, metaItem.last_edited_timestamp])
    );

    const combined = notes.map(note => ({
      noteId: note.noteId,
      content: note.content,
      title: note.title,
      last_edited_timestamp: metaMap.get(note.noteId) || null
    }));

    return res.json({ notes: combined });
  } catch (e) {
    console.error("Error in notes:", e);
    res.status(500).json({ msg: e.message });
  }
});


app.post('/notes',authMiddleware, async (req,res) => {
  const username = req.username;
  const {title, content} = req.body;
  const noteId = uuid();
  try{
      await docClient.send(new PutCommand({
      TableName: NOTES_TABLE,
        Item:{
          noteId,
          username:username,
          title,
          content,
        }
      }))
      
      await docClient.send(new PutCommand({
      TableName: NOTES_META_TABLE,
        Item:{
          noteId,
          last_edited_timestamp: new Date().toISOString(),
        }
      }))

      return res.json({msg:`Created A Note Successfully With Id - ${noteId}`});
  }
  catch(e){
    console.error(e);
    return res.json({msg:e.message});
  }
})

app.put('/notes/:id',authMiddleware, async (req,res) => {
  const noteId = req.params.id;
  const username = req.username;
  const { content } = req.body;
  try{

    const { Item } = await docClient.send(new GetCommand({
      TableName: NOTES_TABLE,
      Key: { username, noteId }
    }))

    if(!Item){
      return res.status(404).json({ msg: "Note not found" });
    }

    if (Item.username !== username) {
      return res.status(403).json({ msg: "Access denied" });
    }

    await docClient.send(new UpdateCommand({
      TableName: NOTES_TABLE,
      Key: { username, noteId },
      UpdateExpression: "SET #content = :content",
      ExpressionAttributeNames: { "#content": "content" },
      ExpressionAttributeValues: { ":content": content }
    }));

    await docClient.send(new UpdateCommand({
      TableName: NOTES_META_TABLE,
      Key: { noteId },
      UpdateExpression: "SET #last_edited_timestamp = :timestamp",
      ExpressionAttributeNames: { "#last_edited_timestamp": "last_edited_timestamp" },
      ExpressionAttributeValues: { ":timestamp": new Date().toISOString() }
    }));

    return res.json({
      msg: "Updated Note Successfully"
    })
  }
  catch(e){
    console.error(e);
    res.status(500).json({ msg: e.message });
  }
})

app.delete('/notes/:id',authMiddleware, async (req,res) => {
  const username = req.username;
  const noteId = req.params.id;

  try{
    await docClient.send(new DeleteCommand({
      TableName: NOTES_TABLE,
      Key: { username, noteId }
    }))

    await docClient.send(new DeleteCommand({
      TableName: NOTES_META_TABLE,
      Key: { noteId }
    }))

    return res.json({msg: "Deleted Note Successfully"})
  }
  catch(e)
  {
    console.error(e);
    res.status(500).json({ msg: e.message });
  }
})

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
