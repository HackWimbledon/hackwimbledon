module.exports = function(config, request, dateFormat, linq) {
  let _currEvents;
  let lastUpdate;
  const _version='1.0.0';

  retrieveEvents = callback => {
    // Retrieves the events from meetup, updating the stored version in the process
    // and then sends the event data on to the callback given
    const apiurl="https://api.meetup.com/hackwimbledon/events?desc=true&page=10&status=upcoming,past&time=-3m,3m";
    request(apiurl, function(error, response, eventsjson) {
      _currEvents= JSON.parse(eventsjson);
        callback(_currEvents);
    });
  };

  updateEvents = callback => {
    // Is the cache valid - lastUpdate should be set and time within our refresh period.
    const dt = new Date();
    if(lastUpdate != undefined &&
        dt.getTime() - lastUpdate.getTime() < config.millisecondsPerRefresh ) {
      callback(_currEvents);
      return;
    }

    // Not fresh so lets update the events...
    retrieveEvents(currEvents => {
      lastUpdate=new Date();
      callback(currEvents);
      });
  };

  getEvents = callback => {
      // Just calls updateEvents and lets that work out whether it should. Gets back the
      // full list of events which it then parses into the three other event lists,
      // current/next, future and past and returns them via a callback
      // Current event becomes past event at end time of event (start time + duration), not start time.
    updateEvents(function(currEvents) {
        dt=(new Date()).getTime();
        futures=(linq.from(currEvents).where("e => (e.time + e.duration) > " + dt)).toArray();
        currentEvent=futures[futures.length-1];
        futureEvents=futures.slice(0,-1);
        pastEvents=linq.from(currEvents).where("e => (e.time + e.duration) < " + dt).orderByDescending("e => e.time").toArray();
        callback(currEvents,currentEvent,futureEvents,pastEvents);

    });
  };

  return {
    version: _version,
    getEvents: getEvents,
    updateEvents: updateEvents,
    currentEvents: _currEvents,
    dateFormat: dateFormat
  };
};
