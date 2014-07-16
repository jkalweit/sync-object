/**
 * Created by jkalweit on 7/16/2014.
 */

var port = process.env.PORT || 1337;

var fs = require('fs');
var http = require('http');
var server = http.createServer(function (req, res) {

    var file = req.url;
    if (file == '/') file = '/index.html';

    fs.readFile('public' + file, function (err, data) {

        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }

        res.writeHead(200);
        res.end(data);
    });

}).listen(port)

//
//function saveDb(room, db) {
//    fs.writeFile('./' + room + '.json', JSON.stringify(db), function (err) {
//        if (err) {
//            console.log(room + ': Error saving db: ' + err);
//        } else {
//            console.log(room + ' db saved.');
//        }
//    });
//}
//
//function loadDb(room, callback) {
//    var path = './' + room + '.json';
//    console.log('loading db: ' + path);
//    if (fs.existsSync(path)) {
//        fs.readFile(path, 'utf8', function (err, data) {
//            if (err) {
//                console.log(room + ': Could not load db: ' + err);
//                callback(null);
//            }
//            console.log('loaded db: ' + path + ': ' + data);
//            callback(JSON.parse(data));
//        });
//    } else {
//        console.log('no db: ' + path);
//        callback(null);
//    }
//}


var io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('join', function(room) {
        console.log('joining: ' + room);
        socket.join(room);
    });

    socket.on('leave', function(room) {
        console.log('leaving: ' + room);
        socket.leave(room);
    });

    socket.on('update', function(room, detail) {
        console.log(room + ': received update: ' + JSON.stringify(detail));
        io.emit('update', room, detail);
    })
});
