import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5015;
app.listen(PORT, () => {
  console.log(`history-service listening on port ${PORT}`);
});
