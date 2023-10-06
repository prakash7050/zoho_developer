/*
Copyright (c) 2017, ZOHO CORPORATION
License: MIT
*/
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var serveIndex = require('serve-index');
var https = require('https');
var chalk = require('chalk');

process.env.PWD = process.env.PWD || process.cwd();


var expressApp = express();
var port = 5000;

expressApp.set('port', port);
expressApp.use(morgan('dev'));
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: false }));
expressApp.use(errorHandler());

var path = require('path'), fs = require('fs');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
var manifest = require(path.join(process.env.PWD, 'plugin-manifest.json'));
var clientid, accountsUrl, scope, fileLocation;

if (manifest && manifest.client && manifest.client.id && manifest.client["accounts-url"] && manifest.client.scope && manifest.file_location) {
  clientid = manifest.client.id;
  accountsUrl = manifest.client["accounts-url"];
  scope = manifest.client.scope;
  fileLocation = manifest.file_location;
} else {
  console.log("Script not included due to issue with plugin-manifest.json");
}

expressApp.get(fileLocation, function (req, res) {
  var filepath = path.join(process.env.PWD, fileLocation);
  fs.readFile(filepath, 'utf8', function (err, data) {
    const dom = new JSDOM(data);
    var doc = dom.window.document;
    if (doc.getElementById("zes_client_scope") != undefined) {
      doc.getElementById("zes_client_scope").remove();
    }
    var script = doc.createElement('script');
    script.id = "zes_client_scope";
    script.setAttribute("data-clientid", clientid);
    script.setAttribute("data-scope", scope);
    script.setAttribute("data-accounts-url", accountsUrl);
    doc.head.appendChild(script);
    res.send(dom.window.document.querySelector('html').outerHTML.toString());
  });
});

expressApp.use('/', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

expressApp.get('/plugin-manifest.json', function (req, res) {
  res.sendfile('plugin-manifest.json');
});

expressApp.use('/app', express.static('app'));
expressApp.use('/app', serveIndex('app'));


expressApp.get('/', function (req, res) {
  res.redirect('/app');
});

var options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

https.createServer(options, expressApp).listen(port, function () {
  console.log(chalk.green('Zet running at ht' + 'tps://127.0.0.1:' + port));
  console.log(chalk.bold.cyan("Note: Please enable the host (https://127.0.0.1:"+port+") in a new tab and authorize the connection by clicking Advanced->Proceed to 127.0.0.1 (unsafe)."));
}).on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.log(chalk.bold.red(port + " port is already in use"));
  }
});

