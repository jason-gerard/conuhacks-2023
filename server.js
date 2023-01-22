const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require("http");
const dotenv = require('dotenv');
const formidable = require("formidable");
const fs = require('fs');
const bodyParser = require('body-parser');
const { send } = require('./sender');
const app = express();
const server = http.createServer(app);

dotenv.config();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder

app.set('port', 8081);
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine

app.get('/', async (req, res) => {
    res.render("pages/index", {fileId: ""});
});

app.post('/uploadfile',(req, res) => {

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    let fileId;

    form.on('file', async function(field, file) {
     const fileName = file.originalFilename.toString();
     const contents = fs.readFileSync(file.filepath,'utf8');

     console.log(contents);

     fileId = await send(fileName, contents);
     console.log({ fileId });
     res.render("pages/index", { fileId });
    });

    form.parse(req);
    // log any errors that occur

});

server.listen(8081, () => {
    console.log(`Server started on port ${server.address().port}`);
});
