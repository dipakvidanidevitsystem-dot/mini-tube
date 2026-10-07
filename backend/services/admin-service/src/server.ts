import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5016;
app.listen(PORT, () => {
  console.log(`admin-service listening on port ${PORT}`);
});
