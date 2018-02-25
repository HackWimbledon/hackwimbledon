module.exports = function(config, request, dateFormat, linq) {
  var _currEvents;
  var lastUpdate;
  var _version = "1.0.0";
  var self = this;

  function retrieveEvents(callback) {
    // Retrieves the events from meetup, updating the stored version in the process
    // and then sends the event data on to the callback given
    var apiurl =
      "https://api.meetup.com/2/events?page=30&status=upcoming,past&time=-3m,3m&key=" +
      config.meetupapikey +
      "&group_urlname=" +
      config.meetupgroup +
      "&sign=true";
    request(apiurl, function(error, response, body) {
      var jj = JSON.parse(body);
      request(jj.meta.signed_url, function(error, response, eventsjson) {
        _currEvents = JSON.parse(eventsjson).results;
        callback(_currEvents);
      });
    });
  }

  function updateEvents(callback) {
    // Is the cache valid - lastUpdate should be set and time within our refresh period.

    var dt = new Date();
    if (
      lastUpdate != undefined &&
      dt.getTime() - lastUpdate.getTime() < config.millisecondsPerRefresh
    ) {
      callback(_currEvents);
      return;
    }

    // Not fresh so lets update the events...

    retrieveEvents(function(currEvents) {
      lastUpdate = new Date();
      callback(currEvents);
    });
  }

  function getEvents(callback) {
    // Just calls updateEvents and lets that work out whether it should. Gets back the
    // full list of events which it then parses into the three other event lists,
    // current/next, future and past and returns them via a callback
    // Current event becomes past event at end time of event (start time + duration), not start time.
    updateEvents(function(currEvents) {
      dt = new Date().getTime();
      currentEvent = linq
        .from(currEvents)
        .where("e => (e.time + e.duration) > " + dt)
        .toArray()[0];
      futureEvents = linq
        .from(currEvents)
        .where("e => (e.time + e.duration) > " + dt)
        .toArray()
        .slice(1);
      pastEvents = linq
        .from(currEvents)
        .where("e => (e.time + e.duration) < " + dt)
        .orderByDescending("e => e.time")
        .toArray();
      callback(currEvents, currentEvent, futureEvents, pastEvents);
    });
  }

  var objToRet = {
    version: _version,
    getEvents: getEvents,
    updateEvents: updateEvents,
    currentEvents: _currEvents,
    dateFormat: dateFormat
  };
  return objToRet;
};
