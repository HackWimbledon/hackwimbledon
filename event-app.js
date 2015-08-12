module.exports = function(config,request,dateFormat,linq){
  var _currEvents;
  var lastUpdate;
  var _version="1.0.0";
 var self=this;

function retrieveEvents() {
  var apiurl="https://api.meetup.com/2/events?page=30&status=upcoming,past&time=-3m,3m&key="+config.meetupapikey+"&group_urlname="+config.meetupgroup+"&sign=true";
  request(apiurl, function(error, response, body) {
    var jj=JSON.parse(body);
    request(jj.meta.signed_url,function(error, response, eventsjson) {
      _currEvents= JSON.parse(eventsjson).results;
    });
  });
}

function updateEvents(){
    _currEvents=retrieveEvents();
    lastUpdate=new Date();    
}

function getEvents() {
 if(lastUpdate==undefined){
	//console.log("initial pop of events");
        //first run
	updateEvents();
	return _currEvents;
  }
  var dt=new Date();
  if(dt.getTime()-lastUpdate.getTime()>config.millisecondsPerRefresh ){
   updateEvents();
  }else{
	//console.log("Not update time yet");
	//console.log(config.millisecondsPerRefresh+"!>"+(dt.getTime()-lastUpdate.getTime()));
	//console.log("last updated:"+dateFormat(lastUpdate, "dddd, mmmm dS, yyyy, h:MM:ss TT"));
  }	
  return _currEvents;
}
function getCurrentEvent(){

    var ev=getEvents();
	var dt=(new Date()).getTime();
	var fEvent=linq.from(ev).where("e=>e.time>"+dt).toArray();
	return [fEvent[0]];	

}
function getEventsComing(){
	var ev=getEvents();
	var dt=(new Date()).getTime();
	var fEvents=linq.from(ev).where("e=>e.time>"+dt).toArray();
	fEvents.shift();
	return fEvents;	
	}
function getEventsPast(){
	var ev=getEvents();
	var dt=(new Date()).getTime();
	var fEvents=linq.from(ev).where("e=>e.time<"+dt).orderByDescending("e=>e.time").toArray();
	
	return fEvents;	
	}


  var objToRet={
     version:_version,
     getEvents:getEvents,
     getEventsComing:getEventsComing,
     getEventsPast:getEventsPast,
     getCurrentEvent:getCurrentEvent,
     updateEvents:updateEvents,
     currentEvents:_currEvents,
     dateFormat:dateFormat
  }
  return objToRet;
}