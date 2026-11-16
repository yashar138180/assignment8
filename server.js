import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/hello", (req, res) => {
  res.send("Hello from Yashar's server");
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: /api/admin\n");
});

app.get("/old-page", (req, res) => {
  res.redirect(301, "/hello");
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});