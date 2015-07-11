var express = require('express');
var app = express();
var hbs = require('hbs');

var request=require("request");

var apikey="674cd67525f25784d306e43202c34";
var group="hackwimbledon";
var apitoken="";

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

hbs.registerPartials(__dirname + '/partials');

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
  var apiurl="https://api.meetup.com/2/events?page=30&status=upcoming,past&time=-3m,3m&key="+apikey+"&group_urlname="+group+"&sign=true";
  //var evts={};
  request(apiurl, function(error, response, body) {
    var jj=JSON.parse(body);
    console.log(jj.meta.signed_url);
    request(jj.meta.signed_url,function(error, response, eventsjson){
        console.log(JSON.parse(eventsjson).results);
        var sorted_results=JSON.parse(eventsjson).results;

          res.render('events', {
            title: 'HackWimbledon Events',
            path: req.path,
            events_found: sorted_results
          });

    });

  });

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
