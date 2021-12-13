const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001

// require mongodb
require("./db/mongodb")

// routers
const usersRouter = require("./routers/users")
const podcastsRouter = require("./routers/podcasts")

app.use(express.json())
app.use(usersRouter);
app.use(podcastsRouter)

app.listen(PORT, () => console.log(`Listerning on PORT ${PORT}`))