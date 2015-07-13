//
// HackWimbledon 2015
//

var express = require('express');
var app = express();
var hbs = require('hbs');
var request = require('request');
var config = require('./config');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.set('view engine', 'hbs');
app.set('view options', {
  layout: 'layouts/main.hbs'
});

app.use(express.static(__dirname + "/public"));

hbs.registerHelper('active',function(mypath) {
  if(mypath==this.path) {
    return "active";
  }
  return "";
});

app.get('/', function(req, res) {
  res.render('welcome', {
    title: 'Welcome',
    path: req.path
   });
});

app.get('/home', function(req, res) {
  res.render('home', {
    title: 'HackWimbledon Home',
    path: req.path
    })
});

app.get('/about',function(req, res) {
  res.render('about', {
    title: 'About HackWimbledon',
    path: req.path
  })
});

app.get('/events',function(req, res) {
  res.render('events', {
    title: 'HackWimbledon Events',
    path: req.path
  })
});

app.get('/chat',function(req, res) {
  res.render('chat', {
    title: 'HackWimbledon Chat',
    path: req.path
  })
});

app.post('/chat', function(req, res) {
  if (req.body.slackemail) {
    request.post({
        url: 'https://'+ config.slackUrl + '/api/users.admin.invite',
        form: {
          email: req.body.slackemail,
          token: config.slacktoken,
          set_active: true
        }
      }, function(err, httpResponse, body) {
        // body looks like:
        //   {"ok":true}
        //       or
        //   {"ok":false,"error":"already_invited"}
        if (err) { return res.send('Error:' + err); }
        body = JSON.parse(body);
        if (body.ok) {
          res.send('Success! Check "'+ req.body.slackemail +'" for an invite from Slack.');
        } else {
          res.send('Failed! ' + body.error)
        }
      });
  } else {
    res.status(400).send('email is required.');
  }
});

app.get('/projects',function(req, res) {
  res.render('projects', {
    title: 'HackWimbledon Projects',
    path: req.path
  })
});

app.get('/resources',function(req, res) {
  res.render('resources', {
    title: 'HackWimbledon Resources',
    path: req.path
  })
});

app.listen(3000);
