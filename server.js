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
    res.render("pages/index");
});

app.post('/uploadfile',upload_file);

server.listen(8081, () => {
    console.log(`Server started on port ${server.address().port}`);
});

function upload_file(req, res, next){
    if(req.method == "POST") {

       // create an incoming form object
       var form = new formidable.IncomingForm();

       // specify that we want to allow the user to upload multiple files in a single request
       form.multiples = true;

       form.on('file', function(field, file) {
        var fileName = file.originalFilename.toString();
        var contents = fs.readFileSync(file.filepath,'utf8');

        send(fileName, contents);
       });

       // log any errors that occur
       form.on('error', function(err) {
           console.log('An error has occured: \n' + err);
       });

       // once all the files have been uploaded, send a response to the client
       form.on('end', function() {
            //res.redirect('/');
           //res.redirect('/');
       });

       // parse the incoming request containing the form data
       form.parse(req);
     }
 }
