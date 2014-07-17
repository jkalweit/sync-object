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


var db = {
    cy: {
        status: 'Hello!',
        customers: {
            currId: 1,
            items: {
                '1': {
                    id: '1',
                    name: 'Justin!'
                }
            }
        }
    }
};

function getValue(path) {
    var parts = path.split('.');
    var value = null;
    if (parts.length > 0)
        value = db[parts[0]];
    for (var i = 1; i < parts.length; i++) {
        if (value.hasOwnProperty(parts[i]))
            value = value[parts[i]];
        else
            return null;
    }
    return value;
}

function setValue(path, value) {
    //console.log('setValue: ' + path + ': ' + JSON.stringify(value));
    var parts = path.split('.');
    if (!parts.length) {
        console.log('path is empty!')
        return;
    }

    var target = db;
    var currPart;
    for (var i = 0; i < parts.length - 1; i++) {
        currPart = parts[i];
        if (!target.hasOwnProperty(currPart)) // build path if doesn't exist
            target[currPart] = {};
        target = target[currPart];
    }

    target[parts[parts.length - 1]] = value;
}

var io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log('a user connected');
//    socket.on('join', function(path) {
//        console.log('joining: ' + path);
//        socket.join(path);
//        socket.emit('init', path, getValue(path));
//    });
//
//    socket.on('leave', function(path) {
//        console.log('leaving: ' + path);
//        socket.leave(path);
//    });

    socket.on('init', function (id, path) {
        console.log('init: ' + id + ': ' + path);
        socket.emit('init', id, path, getValue(path));
    });

    socket.on('update', function (id, path, value) {
        console.log(id + ': ' + path + ': received update: ' + JSON.stringify(value));
        setValue(path, value)
        io.emit('update', id, path, value);
    });

    socket.on('additem', function (id, path, value) {
        var list = getValue(path);
        if (!list.currId)
            list.currId = 0;
        if(!list.items)
            list.items = {};
        value.id = ++list.currId;
        list.items[value.id] = value;

        setValue(path, list);
        io.emit('update', '', path, list);
    });
});
