import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5012;
app.listen(PORT, () => {
  console.log(`user-service listening on port ${PORT}`);
});
