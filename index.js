//
// HackWimbledon 2016
//
const express = require('express');
const app = express();
const hbs = require('hbs');
const request = require('request');
const config = require('./config');
const fs = require('fs');
const resourcedata = JSON.parse(fs.readFileSync('./data_sources/resources.json', 'utf8'));
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const dateFormat = require('dateformat');
const linq = require('linq');
const jsonfile = require('jsonfile');
const eventsApp = require('./event-app.js')(config, request, dateFormat, linq);

const sessionStore = new session.MemoryStore;
const file = 'data_sources/projects.json';
let projects;

jsonfile.readFile(file, (err, obj) => {
    if (err) {
        console.log(err);
    }
    projects = obj;
});

app.set('view engine', 'hbs');
app.set('view options', {
    layout: 'layouts/main.hbs'
});

hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('active', mypath => {
    if (mypath == this.path) {
        return 'active';
    }
    return '';
});

hbs.registerHelper('hbDateFormat', somedate => {
    return new hbs.SafeString(dateFormat(somedate, 'dddd, mmmm dS, yyyy @ HH:MM'));
});
hbs.registerHelper('hbStringify', somejson => {
    return JSON.stringify(somejson);
});
hbs.registerHelper('hbDateFormatShort', somedate => {
    return new hbs.SafeString(dateFormat(somedate, 'dddd, mmmm dS, yyyy'));
});

app.use(cookieParser());
app.use(session({
    cookie: {
        maxAge: 60000
    },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.use(flash());


app.get('/', (req, res) => {
    res.render('welcome', {
        title: 'Welcome to HackWimbledon',
        path: req.path
    });
});

app.get('/home', (req, res) => {
    eventsApp.getEvents((events, currentEvent) => {
        res.render('home', {
            title: 'HackWimbledon Home',
            path: req.path,
            currentEvent: currentEvent
        });
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About HackWimbledon',
        path: req.path
    });
});

app.get('/events', (req, res) => {
    // Call getEvents - this now returns the full event list, currentEvent (singular - could just
    // be the nextEvent), futureEvents and pastEvents. These are all handed over for rendering.
    eventsApp.getEvents((events, currentEvent, futureEvents, pastEvents) => {
        res.render('events', {
            title: 'HackWimbledon Events',
            path: req.path,
            events: events,
            currentEvent: currentEvent,
            futureEvents: futureEvents,
            pastEvents: pastEvents
        });
    });
});

app.get('/chat', (req, res) => {
    res.render('chat', {
        title: 'HackWimbledon Chat',
        path: req.path,
        infoFlash: req.flash('info'),
        errorFlash: req.flash('error')
    });
});

app.post('/chat', (req, res) => {
    if (req.body.slackemail) {
        //
        // Sources used for Slack API call:
        // https://github.com/outsideris/slack-invite-automation
        // https://levels.io/slack-typeform-auto-invite-sign-ups/
        //
        request.post({
            url: 'https://' + config.slackUrl + '/api/users.admin.invite',
            form: {
                email: req.body.slackemail,
                token: config.slacktoken,
                set_active: true
            }
        }, (err, httpResponse, body) => {
            // body looks like:
            //   {"ok":true}
            //       or
            //   {"ok":false,"error":"already_invited"}
            if (err) {
                const error = String(err);
                if (error.search('Invalid URI') >= 0) {
                    req.flash('error', 'Unable to contact Slack.  Please contact HackWimbledon ' +
                      'and report "Slack invalid URI".');
                } else {
                    req.flash('error', 'Unable to contact Slack.  Please contact HackWimbledon ' +
                      'and report "' + error + '".');
                }
                return res.redirect(301, '/chat#slackform');
            }
            body = JSON.parse(body);
            if (body.ok) {
                req.flash('info', 'Success! Check "' + req.body.slackemail +
                  '" for an invitation from Slack.');
                return res.redirect(301, '/chat#slackform');
            } else {
                if (body.error.search('Invalid URI') >= 0) {
                    req.flash('error', 'Unable to contact Slack.  Please contact HackWimbledon ' +
                      'and report "Slack invalid URI".');
                } else if (body.error.search('not_authed') >= 0) {
                    req.flash('error', 'Unable to contact Slack.  Please contact HackWimbledon ' +
                      'and report "Slack not authorised".');
                } else if (body.error.search('already_in_team') >= 0) {
                    req.flash('error', 'That email address is already a team member.');
                } else if (body.error.search('already_invited') >= 0) {
                    req.flash('error',
                      'An invitation has already been requested for that email address.');
                } else if (body.error.search('invalid_email') >= 0) {
                    req.flash('error',
                      'Slack does not like the format of that email address. Please try again.');
                } else {
                    req.flash('error', 'Problem connecting to Slack. ' +
                      'Please contact HackWimbledon and report "' + body.error + '".');
                }
                return res.redirect(301, '/chat#slackform');
            }
        });
    } else {
        req.flash('error', 'Please enter an email address.');
        return res.redirect(301, '/chat#slackform');
    }
});

app.get('/projects', (req, res) => {
    res.render('projects', {
        title: 'HackWimbledon Projects',
        path: req.path
    });
});

app.get('/projects/:project', (req, res) => {
    id = req.params.project;
    if (projects[id]) {
        res.render('project', {
            title: 'HackWimbledon Projects',
            path: req.path,
            project: projects[id]
        });
    } else {
        res.sendStatus(404);
        res.end();
    }
});

app.get('/resources', (req, res) => {
    res.render('resources', {
        title: 'HackWimbledon Resources',
        resources: resourcedata,
        path: req.path
    });
});

// Handle 404
app.use((req, res) => {
    res.status(400);
    res.render('404', {
        title: '404: Page Not Found',
        path: req.path
    });
});

// Handle 500
app.use((error, req, res) => {
    res.status(500);
    res.render('500', {
        title: '500: Internal Server Error',
        error: error,
        path: req.path
    });
});

app.listen(config.listenport);
