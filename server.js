const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require("http");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('port', 8081);

app.get('/', async (req, res) => {
    res.render("pages/index");
});

const server = http.createServer(app);

server.listen(8081, () => {
    console.log(`Server started on port ${server.address().port}`);
});
