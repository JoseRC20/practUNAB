const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

(async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`API corriendo en: ${PORT}`));
})();
