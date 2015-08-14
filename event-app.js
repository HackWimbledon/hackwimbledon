module.exports = function(config,request,dateFormat,linq){
  var _currEvents;
  var lastUpdate;
  var _version="1.0.0";
  var self=this;

  function retrieveEvents(callback) {
    var apiurl="https://api.meetup.com/2/events?page=30&status=upcoming,past&time=-3m,3m&key="+config.meetupapikey+"&group_urlname="+config.meetupgroup+"&sign=true";
    request(apiurl, function(error, response, body) {
      var jj=JSON.parse(body);
      request(jj.meta.signed_url,function(error, response, eventsjson) {
        _currEvents= JSON.parse(eventsjson).results;
        callback(_currEvents);
      });
    });
  }

  function updateEvents(callback){
    // Is the cache valid - lastUpdate should be set and time within our refresh period.

    var dt=new Date();
    if(lastUpdate!=undefined && dt.getTime()-lastUpdate.getTime()<config.millisecondsPerRefresh ){
        callback(_currEvents);
        return;
    }

    // Not fresh so lets update the events...

    retrieveEvents(function (currEvents) {
      lastUpdate=new Date();
      callback(currEvents);   
      });
  }

  function getEvents(callback) {
    	updateEvents(function(currEvents) {
        dt=(new Date()).getTime();
        currentEvent=(linq.from(currEvents).where("e=>e.time>"+dt).toArray())[0];
        futureEvents=linq.from(currEvents).where("e=>e.time>"+currentEvent.time).toArray();
        pastEvents=linq.from(currEvents).where("e=>e.time<"+dt).orderByDescending("e=>e.time").toArray();
        callback(currEvents,currentEvent,futureEvents,pastEvents);
      });
  }
  
  var objToRet={
     version:_version,
     getEvents:getEvents,
     updateEvents:updateEvents,
     currentEvents:_currEvents,
     dateFormat:dateFormat
  }
  return objToRet;
}