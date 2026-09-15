import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5013;
app.listen(PORT, () => {
  console.log(`video-service listening on port ${PORT}`);
});
