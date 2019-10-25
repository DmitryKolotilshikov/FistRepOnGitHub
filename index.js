const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;


const port = process.env.PORT || 3000;

var db;
const app = express();

const server = app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .listen(port, () => {
        console.log('Server started on port: ', port)
    }) //важно назвать переменную server

const wss = new WebSocket.Server({ server });


wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.send('Welcome to Chat!');
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
        if (result) {
            db.collection('users').insertOne(user);
            res.sendStatus(200);
        } else {
            res.sendStatus(501);
        }
    })
});





























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

