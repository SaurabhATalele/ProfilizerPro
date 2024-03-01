import express from "express";
import dotenv from "dotenv";
import getGPT3Response from "./Controllers/openai.js";
dotenv.config();

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  const response = await getGPT3Response(prompt);
  var x = response.replace("\n", "");
  x = x.replaceAll("'", `"`);

  const resp = JSON.parse(x);
  if (response) {
    res.status(200).json({ response: resp });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Listening to the port ${process.env.PORT}`);
});
