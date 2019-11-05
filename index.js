const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


const port = process.env.PORT || 3000;

var db;
const app = express();

const server = app
    .use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .listen(port, () => {
        console.log('Server started on port: ', port)
    }) //важно назвать переменную server

const wss = new WebSocket.Server({ server });


wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        saveMessage(message);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
})

MongoClient.connect('mongodb+srv://chat:43214321@chatdb-mqh1r.mongodb.net/test?retryWrites=true&w=majority', (err, database) => {
    if (err) {
        return console.log(err);
    }
    db = database.db('angrychatdb');
    // db.collection('users').insertOne({ name: 'Test' });
})



//----------------API----------------------//

app.get('/', (_, res) => {
    res.send('WELCOME TO CHAT API');
});

app.post('/users', (req, res) => {
    const user = req.body;
    db.collection('users').findOne({ name: user.name }, (err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (!result) {
            db.collection('users').insertOne(user, (err) => {
                db.collection('users').findOne({ name: user.name }, (err, data) => {
                    res.send(data._id);
                })
            });
        } else {
            res.sendStatus(501);
        }
    })
});

app.get('/users', (req, res) => {
    db.collection('users').find().toArray((err, data) => {
        const users = data.map(user => {
            return {
                name: user.name,
                avatar: user.avatar ? user.avatar : null
            }
        });
        res.send(JSON.stringify(users));
    })
});


app.post('/auth', (req, res) => {
    const user = req.body;
    db.collection('users').findOne({ name: user.name, password: user.password }, (err, data) => {
        if (err) {
            return res.sendStatus(500);
        }

        if (data) {
            res.send(data._id)
        } else {
            res.sendStatus(401);
        }

    })
});

app.post('/user', (req, res) => {
    const user = req.body;
    const userId = req.query.userid;
    db.collection('users').updateOne({ _id: ObjectID(userId) },
        { $set: { name: user.name, password: user.password, avatar: user.avatar } }, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.send(JSON.stringify(user));
        })
})

app.get('/user', (req, res) => {
    const userId = req.query.userid;
    db.collection('users').findOne({ _id: ObjectID(userId) }, (err, user) => {
        if (err) {
            return res.sendStatus(500)
        }
        if (user) {
            res.send(JSON.stringify(user));
        } else {
            res.sendStatus(404)
        }
    })
})

app.get('/messages', (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    db.collection('messages').find().toArray((err, data) => {
        if (err) {
            return res.sendStatus(500)
        }
        const messages = data.reverse().slice(from, to)
        res.send(JSON.stringify(messages))
    })
})

function saveMessage(message) {
    if (message) {
        const mes = JSON.parse(message)
        db.collection('messages').insertOne(mes);
    }
}


























// var express = require('express');
// var bodyParser = require('body-parser');
// const MongoClient = require('mongodb').MongoClient;
// // создаем объект MongoClient и передаем ему строку подключения
// const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });

// var app = express();
// var db;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extented: true }));

// // ------------ API ------------

// app.post('/users', (req, res) => {
//     const user = req.body
// })

// // -----------------------------

// app.listen(3012, () => {
//     mongoClient.connect((err, client) => {
//         if (err) {
//             return console.log(err)
//         }

//         db = client.db('chat-database');
//         db.collection('users').insertOne({ name: 'test' }, (err, res) => {
//             if (err) {
//                 console.log(err)
//             } else {
//                 console.log(res)
//             }
//         })
//     });

//     console.log('mySERVER STARTED!');
// })

