var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const VERIFY_TOKEN = "ifightforthegrid";

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if(mode && token) {
        if(mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook Verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

router.post('/', function(req, res, next) {
    if(req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            let senderID = webhookEvent.sender.id;
            handleMessages(webhookEvent.message, senderID);
        });

    res.status(200).send('EVENT_RECEIVED');

    } else {
        res.sendStatus(404);
    }
});

function handleMessages(message, senderID) {
    let response;

    if(message.text) {
        response = { "text" : message.text };
    }
    console.log("HERE");
    callSendAPI(response, senderID);
}

function callSendAPI(response, senderID) {
    console.log("ALSO HERE");
    let requestBody = {
        "recipient": {
            "id": senderID
        },
        "message": response
        };
  
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": ACCESS_TOKEN },
        "method": "POST",
        "json": requestBody
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent!')
            } else {
                console.error("Unable to send message:" + err);
            }
        }); 
    console.log("DONE");
}
module.exports = router;
