var fs = require('fs');
var util = require('util');
var express = require('express');
var config = require('./config');
var app = express();
var pg = require('pg');

app.use(express.static('public'));

var conString = util.format("postgres://%s:%s@%s/%s", config.db.username, config.db.password, config.db.hostname, config.db.database);

var query1 = fs.readFileSync('query1.sql', {encoding: 'utf8'});
var query2 = fs.readFileSync('query2.sql', {encoding: 'utf8'});
var query3 = fs.readFileSync('query3.sql', {encoding: 'utf8'});

app.get('/', function (req, res) {
  res.send({
    message: 'Welkom op Nienes eerste API!',
    urls: [
      'http://localhost:3000/query1?aantal=20',
      'http://localhost:3000/query2?string=Hallootjes',
      'http://localhost:3000/query3',
      'http://localhost:3000/map.html'
    ]
  });
});

app.get('/query1', function (req, res) {
  query(query1, [req.query.aantal], function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(result.rows);
    }
  });
});

app.get('/query2', function (req, res) {
  query(query2, [req.query.string], function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(result.rows);
    }
  });
});

app.get('/query3', function (req, res) {
  query(query3, null, function(err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({
        type: 'FeatureCollection',
        features: [
          JSON.parse(result.rows[0].geojson)
        ]
      });
    }
  });
});

function query(sql, params, callback) {

  // Voor meer informatie over node-postgres, zie:
  // https://github.com/brianc/node-postgres
  pg.connect(conString, function(err, client, done) {
    if(err) {
      callback(err);
    } else {
      client.query(sql, params, function(err, result) {
        done();
        callback(err, result);
      });
    }
  });
}

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Nienes API is bereikbaar op http://%s:%s', host, port);
});
