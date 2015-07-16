//
// HackWimbledon 2015
//

var express = require('express');
var app = express();
var hbs = require('hbs');
var request = require('request');
var config = require('./config');


var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');

var sessionStore = new session.MemoryStore;

app.set('view engine', 'hbs');
app.set('view options', {
  layout: 'layouts/main.hbs'
});

hbs.registerHelper('active',function(mypath) {
  if(mypath==this.path) {
    return "active";
  }
  return "";
});

app.use(cookieParser());
app.use(session({
    cookie: { maxAge: 60000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

app.use(flash());



app.get('/', function(req, res) {
  res.render('welcome', {
    title: 'Welcome',
    path: req.path
    })
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
    path: req.path,
    infoFlash: req.flash('info'),
    errorFlash: req.flash('error')
  })
});

app.post('/chat', function(req, res) {
  if (req.body.slackemail)
  {
    //
    // Sources used for Slack API call:
    // https://github.com/outsideris/slack-invite-automation
    // https://levels.io/slack-typeform-auto-invite-sign-ups/
    //
    request.post({
        url: 'https://'+ config.slackUrl + '/api/users.admin.invite',
        form: {
          email: req.body.slackemail,
          token: config.slacktoken,
          set_active: true
        }
      }, function(err, httpResponse, body)
         {
           // body looks like:
           //   {"ok":true}
           //       or
           //   {"ok":false,"error":"already_invited"}
           if (err)
           {
             var error = String(err);
             if (error.search("Invalid URI") >= 0)
             {
               req.flash('error', 'Unable to contact Slack.  Please contact Hackwimbledon and report "Slack invalid URI".');
             }
             else
             {
               req.flash('error', 'Unable to contact Slack.  Please contact Hackwimbledon and report "' + error + '".');
             }
	     return res.redirect(301, '/chat#slackform');
           }
           body = JSON.parse(body);
           if (body.ok)
           {
             req.flash('info', 'Success! Check "'+ req.body.slackemail +'" for an invitation from Slack.');
             return res.redirect(301, '/chat#slackform');

           }
           else
           {
             if (body.error.search("Invalid URI") >= 0)
             {
               req.flash('error', 'Unable to contact Slack.  Please contact Hackwimbledon and report "Slack invalid URI".');
             }
             else if (body.error.search("not_authed") >= 0)
             {
               req.flash('error', 'Unable to contact Slack.  Please contact Hackwimbledon and report "Slack not authorised".');
             }
             else if (body.error.search("already_in_team") >= 0)
             {
               req.flash('error', 'That email address is already a team member.');
             }
             else if (body.error.search("already_invited") >= 0)
             {
               req.flash('error', 'An invitation has already been requested for that email address.');
             }
             else if (body.error.search("invalid_email") >= 0)
             {
               req.flash('error', 'Slack does not like the format of that email address. Please try again.');
             }
             else
             {
               req.flash('error', 'Problem connecting to Slack.  Please contact Hackwimbledon and report "' + body.error + '".');
             }
             return res.redirect(301, '/chat#slackform');
           }
         });
  }
  else
  {
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

app.listen(config.listenport);
