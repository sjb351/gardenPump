import express from "express";
//import mysql from "mysql";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

const dbPromise = open({
  filename: './data/data.db',
  driver: sqlite3.Database
});


app.get("/", (req, res) => {
  res.json("hello welcome to the database backend");
});

app.delete("/clearData", async (req, res) => {
  // updates all value (should be just one in the database)
  try{
    const db = await dbPromise;
    const queryUpdate = "DELETE FROM datastore";
    await db.run(queryUpdate);
    res.json({ message: "Data cleared from WORKER" });
  } catch (err) {
    console.error("Error in /clearData:", err.message);
  }
});

app.get("/get", async (req, res) => {
  try {
    const db = await dbPromise;
    let name = "pump_1";
    // if (req.body != undefined || req.body.id != undefined) {
    //   name = "pump_" + String(req.body.id);
    // } else{
    //   name = "pump_1";
    // }
    const queryUpdate ="SELECT * FROM " + name 
    const data = await db.all(queryUpdate);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/post", async (req, res) => {
  // updates all value (should be just one in the database)
  // try{
    //console.error(req.body);
    const db = await dbPromise;
    const queryUpdate = "UPDATE pump_1 SET state = (?)";
    if(req.body != null){
    const values = [
      req.body.state
    ];
    await db.run(queryUpdate, values);
    
    const queryUpdate2 = "INSERT INTO `datastore` (`pump`, `state`) VALUES (?, ?) RETURNING rowid as rowid";
    const values2 = [
      "pump_" + String(req.body.ID),
      req.body.state
    ];
    await db.run(queryUpdate2, values2);
    res.json({ message: "State updated successfully" });
  } else {
    res.status(500).json({ error: "null data" });
  }

});


app.listen(8700, () => {
  console.log("Connected to backend.");
});
