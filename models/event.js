const mongoose = require('mongoose');

let EventSchema = mongoose.Schema ({
    year: {
      type: Number
    },
    month: {
      type: Number
    },
    date: {
      type: Number
    },
    weeksIndex: {
      type: Number
    },
    dayIndex: {
      type: Number
    },
    title: {
      type: String
    },
    description: {
      type: String
    }
});

let Event = module.exports = mongoose.model('Event', EventSchema);


module.exports.fetchEvents = function(date, callback){
    Event.find ({
      year: date.year,
      month: date.month
    },
    callback);
};


module.exports.createEvent = function(newEvent, callback){
    newEvent.save(callback);
};


module.exports.editEvent = function(eventData, callback){
    Event.findById(eventData.id, function (err, event) {
        event.title = eventData.title;
        event.description = eventData.description;
        event.save(callback);
    });
};


module.exports.deleteEvent = function(eventId, callback){
    Event.findById(eventId, function (err, event) {
        event.remove(callback);
    });
};
