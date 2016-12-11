'use strict'
//const apiId='c28a1e1302889f5897d546507cbbf75a'
const apiId = 'c28a1e1302889f5897d546507cbbf75a'
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token ='EAAXoxvfpHBIBAABNenS6mHTzxDDYOZC0y92uDOOLQr74qAgUzrSZA2W6XFl6pa4mJ22rkbutIwE0LHKWtnGJzWlpuq9yO9WbBZCQiXYaUqVRXQuodoVaMwyIIGo71eAZAj6ZCAyKwnVxzn5nGR64INgrzKPlME69tGojz9EGP5gZDZD'
//const token = 'EAAaG7VDrL3kBABQLWUHRIwe4NGTrp4GwrvZB5WTFYZAOYtdQLUh8bkrlxuyW7bxDMUBeIfTpxOdQYQt5W1YDJUXp9YscCDbw6zw6sNYyposksK1ptAngdcohrHeIbWtMoSdz4k19WBjLnOB0ioZBZAhHtg7CWlnGtUPqZBrN4PgZDZD'
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.send('test test')
})
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'passbot') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
let messaging_events = req.body.entry[0].messaging
for (let i = 0; i < messaging_events.length; i++) {
let event = req.body.entry[0].messaging[i]
let sender = event.sender.id
if (event.message && event.message.text) {
let text = event.message.text
var cityName = event.message.text
var weatherUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' +cityName+ '&units=metric&appid=' +apiId
request({
        url: weatherUrl,
        json: true
      }, function(error, response, body) {
try {
var con = body.main;
sendTextMessage(sender, "Today temporary " + con.temp + " °C  " + "-- at " + cityName);
        } catch(err) {
console.error('error caught', err);
sendTextMessage(sender, "please insert correctly city ");
        }
      })
    }
if (event.postback) {
let text = JSON.stringify(event.postback)
sendTextMessage(sender, 'Postback received: ' + text.substring(0, 200), token)
continue
    }
  }
res.sendStatus(200)
})

function sendTextMessage (sender, text) {
  let messageData = { text: text }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendGenericMessage (sender) {
  let messageData = {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [{
          'title': 'First card',
          'subtitle': 'Element #1 of an hscroll',
          'image_url': 'http://messengerdemo.parseapp.com/img/rift.png',
          'buttons': [{
            'type': 'web_url',
            'url': 'https://www.messenger.com',
            'title': 'web url'
          }, {
            'type': 'postback',
            'title': 'Postback',
            'payload': 'Payload for first element in a generic bubble'
          }]
        }, {
          'title': 'Second card',
          'subtitle': 'Element #2 of an hscroll',
          'image_url': 'http://messengerdemo.parseapp.com/img/gearvr.png',
          'buttons': [{
            'type': 'postback',
            'title': 'Postback',
            'payload': 'Payload for second element in a generic bubble'
          }]
        }]
      }
    }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
