import express, { response } from "express";
import dotenv from "dotenv";
import getGPT3Response from "./Controllers/openai.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  var resp = await getGPT3Response(prompt);

  console.log("response genearted Successfuly...");
  resp = resp.replaceAll("```json", "");
  resp = resp.replaceAll("```", "");
  resp = resp.replaceAll("'", `"`);
  console.log(resp);

  // var x = response.replace("\n", "");
  // let dummy = `{"question": "Is the "None" value a data type in Python?"}`;
  // dummy = dummy.split(":")[1].replaceAll('"', "");
  // // let dum = JSON.parse(dummy);
  // console.log(dummy);

  // console.log(x)
  // x = x.replaceAll("'", `"`);
  // let correctedResponse = response
  //   .replace(/'([^']+)':/g, '"$1":')
  //   .replace(/'([^']+)'/g, '"$1"')
  //   .replace(/"'/g, '\\"')
  //   .replace(/'"/g, '\\"');

  // // Parse the JSON string inside the response key
  // let resp = JSON.parse(correctedResponse);

  var x = JSON.parse(resp);
  // console.log(resp);
  if (response) {
    res.status(200).json({ response: x });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Listening to the port ${process.env.PORT}`);
});
