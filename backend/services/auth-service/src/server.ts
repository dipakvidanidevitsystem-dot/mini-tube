import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5011;
app.listen(PORT, () => {
  console.log(`auth-service listening on port ${PORT}`);
});
