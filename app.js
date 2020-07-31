const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
var Array1 = [];
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;

const dbURL = "mongodb://127.0.0.1:27017/";
const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("your app is running in", port));

app.post("/register/:email", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("CRMS");
    db.collection("admin").findOne({ email: req.params.email }, (err, data) => {
      if (err) throw err;
      console.log(data);
      if (data.type != "admin") {
        res.status(400).json({ message: " I am not a admin" });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          console.log(req.body);
          console.log("password", req.body.password);
          console.log("'salt", salt);
          console.log("err", err);
          bcrypt.hash(req.body.password, salt, (err, cryptPassword) => {
            if (err) throw err;
            console.log(err);
            req.body.password = cryptPassword;
            db.collection("admin").insertOne(req.body, (err, result) => {
              if (err) throw err;
              client.close();
              res
                .status(200)
                .json({ message: " Staff Registration successful..!! " });
            });
          });
        });
      }
    });
  });
});
app.get("/showRegister", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("CRMS");
    db.collection("admin")
      .find()
      .toArray()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(404).json({
          message: "No data Found or some error happen",
          error: err,
        });
      });
  });
});

app.post("/login", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    client
      .db("CRMS")
      .collection("admin")
      .findOne({ email: req.body.email }, (err, data) => {
        if (err) throw err;
        if (data) {
          bcrypt.compare(req.body.password, data.password, (err, validUser) => {
            if (err) throw err;
            if (validUser) {
              jwt.sign(
                { userId: data._id, email: data.email },
                "uzKfyTDx4v5z6NSV",
                { expiresIn: "1h" },
                (err, token) => {
                  Array1.push(token);
                  console.log(Array1);
                  res.status(200).json({ message: "Login success..!!", token });
                }
              );
            } else {
              res
                .status(403)
                .json({ message: "Bad Credentials, Login unsuccessful..!!" });
            }
          });
        } else {
          res.status(401).json({
            message: "Email is not registered, Kindly register..!!",
          });
        }
      });
  });
});
app.get("/showLogin", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("LoginRecords");
    db.collection("student")
      .find()
      .toArray()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(404).json({
          message: "No data Found or some error happen",
          error: err,
        });
      });
  });
});
app.post("/servies/:email", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("CRMS");
    db.collection("admin").findOne({ email: req.params.email }, (err, data) => {
      console.log(data);
      if (err) throw err;
      if (data.type == "admin" || data.type == "employee") {
        res.status(400).json({
          message: " I am not a mangaer ,so i can able to see my services",
        });
      } else {
        db.collection("assignment").insertOne(req.body, (err, result) => {
          if (err) throw err;
          client.close();
          res
            .status(200)
            .json({ message: " Customer Registration successful..!! " });
        });
      }
    });
  });
});

app.put("/serviceupdated/:email", (req, res) => {
  mongoClient.connect(dbURL, (err, client) => {
    if (err) throw err;
    let db = client.db("CRMS");
    db.collection("admin").findOne({ email: req.params.email }, (err, data) => {
      console.log(data);
      if (err) throw err;
      if (
        !(data.type == "employee" && data.edit == "yes" && data.access == true)
      ) {
        res.status(400).json({
          message: " I am employee or manger so i cant able to edit my request",
        });
      } else {
        db.collection("assignment")
          .findOneAndUpdate({ email: req.params.name }, { $set: req.body })
          .then((data) => {
            console.log("employee data update successfully..!!");
            client.close();
            res.status(200).json({
              message: "User data updated..!!",
            });
          });
      }
    });
  });
});
