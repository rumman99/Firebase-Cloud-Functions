import * as functions from "firebase-functions";
import express from "express";
import * as admin from "firebase-admin";
import cors from "cors";

const serviceAccount = require("../../firebase_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const db = admin.firestore();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/create-user", async (req, res) => {
  try {
    const { name, email } = req.body;
    await db.collection("users").add({ name, email });

    return res.status(200).send("Succesfully Created");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to create user");
  }
});

app.get("/allUser", async (req, res) => {
  try {
    const allUser = await db.collection("users").get();

    let users: any = [];
    allUser.forEach((user) => users.push({ id: user.id, ...user.data() }));
    if(users.length <=0){
        return res.status(500).send("No user Found");
    }
    return res.status(200).json({ message: "Succesfully Get Data", users });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to Get users data");
  }
});

app.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    return res.status(200).json("Succesfully Delete User");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to Delete users");
  }
});

app.patch("/update-user/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {email, name}= req.body;

      if(email===undefined || name===undefined){
        return res.status(200).json("undefined name or email");
      }

      await db.collection("users").doc(id).update({email, name});
      return res.status(200).json("Succesfully Update User");
    } 
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  });

export const appFunction = functions.https.onRequest(app);
