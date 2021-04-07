const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

const platformDataRouter = require('./routes/platformData');
const userRouter = require('./routes/user');
const pageFormatRouter = require('./routes/pageFormat');
const platformFormatRouter = require('./routes/platformFormat');
app.use('/platformData', platformDataRouter);
app.use('/user', userRouter);
app.use('/platformFormat', platformFormatRouter)
app.use('/pageFormat', pageFormatRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});