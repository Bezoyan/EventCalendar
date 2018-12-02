const express = require('express');
const app = express();
const  path = require('path');
const  bodyParser = require('body-parser');
const  mongoose = require('mongoose');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const EventModel = require('./models/event');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// To get events
app.get('/events', function (req, res) {
    EventModel.fetchEvents({year: req.query.year, month: req.query.month},function (err, events) {
        if(err) {
            res.json ({
							status: 404,
							errors: errors
						});
        }
				else {
            res.json({
							status: 200,
							data: events});
        }
    });
});


//To create  a new event
app.post('/events', function (req, res) {
    let newEvent = new EventModel({
        year: req.body.year,
        month: req.body.month,
        date: req.body.date,
        weeksIndex: req.body.weeksIndex,
        dayIndex: req.body.dayIndex,
        title: req.body.title,
        description: req.body.description
    });
    EventModel.createEvent(newEvent, function (err, event) {
        if(err) {
            res.json ({
							status: 404,
							message: "Error to creating event"
						});
        }
				else {
            io.sockets.emit('create_event', event);
            res.json ({
							status: 200,
							message: "Event is created",
							data: event
						});
        }
    });
});

//Update event
app.put('/events/:id', function (req, res) {
    EventModel.editEvent ({
				id: req.params.id,
				title: req.body.title,
				description: req.body.description
			},
			  function (err, event) {
        	if(err) {
            	res.json({
								status: 400,
								message: "Failed to update event"
							});
        	}
					else {
						io.sockets.emit('edit_event', req.body);
            res.json ({
							status: 200,
							message: "Event updated successfully",
							data: req.body
						});
        }
    });
});

//Delete event
app.delete('/events/:id', function (req, res) {
    EventModel.deleteEvent(req.params.id, function (err, event) {
        if(err) {
            res.json ({
							status: 404,
							message: "Event is not deleted, please try again"
						});
        }
				else {
          io.sockets.emit('delete_event', req.query);
          res.json ({
						status: 200,
						message: "Event deleted successfully"
					});
        }
    });
});


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/event_calendar', { useMongoClient: true});
mongoose.connection.on('error', function(err) {
    console.log('Mongodb is not running.');
    process.exit();
}).on('connected', function() {
    server.listen(app.get('port'), function() {
        console.log('Server started on port:' + app.get('port'));
    });
});

app.set('port', 3333);

module.exports = app;
