const functions = require("firebase-functions");
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
const express = require("express");
const app = express();


// app.get("/", (req, res) => {
//     res.status(200).send(leaderboard)
// });

app.get("/ones", (req, res) => {
    res.status(200).send();
});

app.get("/twos", (req, res) => {
    res.status(200).send();
});

app.get("/threes", (req, res) => {
    res.status(200).send();
});

app.get("/fours", (req, res) => {
    res.status(200).send();
});

app.get("/fives", (req, res) => {
    res.status(200).send();
});

app.get("/sixes", (req, res) => {
    res.status(200).send();
});

app.get("/sum", (req, res) => {
    res.status(200).send();
});

app.get("/bonus", (req, res) => {
    res.status(200).send();
});

app.get("/three-of-a-kind", (req, res) => {
    res.status(200).send();
});

app.get("/four-of-a-kind", (req, res) => {
    res.status(200).send();
});

app.get("/full-house", (req, res) => {
    res.status(200).send();
});

app.get("/small-straight", (req, res) => {
    res.status(200).send();
});

app.get("/large-straight", (req, res) => {
    res.status(200).send();
});

app.get("/chance", (req, res) => {
    res.status(200).send();
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
