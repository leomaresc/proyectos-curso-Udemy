import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://secrets-api.appbrewery.com/";

//TODO 1: Fill in your values for the 3 types of auth.
const yourUsername = "leomaresc";
const yourPassword = "2121";
const yourAPIKey = "cbffe34c-95b6-4106-9ab2-9a018ac84055";
const yourBearerToken = "3697921a-b671-478b-ad62-0be04065f854";

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "API Response." });
});

app.get("/noAuth", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "random");
    const result = response.data;
    console.log(result);
    res.render("index.ejs", { content: JSON.stringify(result) });
  } catch (error) {
    console.error("Failed to make request: ", error);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.get("/basicAuth", async (req, res) => {
  try {
    const response = await axios.get(API_URL + "all?page=1", {
      auth: {
        username: yourUsername,
        password: yourPassword,
      },
    });
    const result = response.data;
    console.log(result);
    res.render("index.ejs", { content: JSON.stringify(result) });
  } catch (error) {
    console.error("Failed to make request: ", error);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.get("/apiKey", async (req, res) => {
  try {
    const response = await axios.get(
      API_URL + "filter?score=" + Math.floor(Math.random() * 8),
      {
        params: { apiKey: yourAPIKey },
      }
    );
    const result =
      response.data[Math.floor(Math.random() * response.data.length)];
    console.log(result);
    res.render("index.ejs", { content: JSON.stringify(result) });
  } catch (error) {
    console.error("Failed to make request: ", error);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.get("/bearerToken", async (req, res) => {
  try {
    const response = await axios.get(
      API_URL + "secrets/" + Math.floor(Math.random() * 10),
      {
        headers: { Authorization: `bearer ${yourBearerToken}` },
      }
    );
    const result = response.data;
    console.log(result);
    res.render("index.ejs", { content: JSON.stringify(result) });
  } catch (error) {
    console.error("Failed to make request: ", error);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
