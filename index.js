//
// HackWimbledon 2015
//

var express = require('express');
var app = express();
var hbs = require('hbs');

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
