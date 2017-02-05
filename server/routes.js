const path = Npm.require('path');
const fs = Npm.require('fs');
const _ = Npm.require('lodash');
const Papa = Npm.require('papaparse');
import jwt from "jsonwebtoken";
import {flatten} from "/lib/js/utilities";
import Participants from "/imports/collections/participants";


Router.route('/csv/:token', function () {
  // TODO: remove services from users and correct createdAt (DATE) issue

  let decoded;

  try {
    decoded = jwt.verify(this.params.token, 'secret');
  } catch (error) {
    if (error) {
      this.response.writeHead(200, {'Content-type': 'text/html'});
      return this.response.end('<html><head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous"></head><body><div class="container"><div class="text-xs-center" style="margin-top: 50px" role="alert"><strong>' + error.name + '</strong> ' + error.message + '</div></div></body></html>');
    }
  }

  let filename = decoded.filename + '.csv';
  let collection = decoded.collection;
  let instance = (_.isEqual(collection, 'users') ? Meteor.users : Participants);
  let query = decoded.query;
  let fields = decoded.fields;
  let download = decoded.download;
  let matches = {};

  this.response.writeHead(200, {
    'Content-type': 'text/csv',
    'Content-Disposition': "attachment; filename =" + filename
  });

  if (_.isEqual(download, 'all')) matches = instance.find().fetch();
  else matches = instance.find(query, {fields: fields}).fetch();

  // _.forEach(filters, function (filter) {
  //   _.assign(selectors, filter)
  // });
  //
  // if (search) {
  //   let regex = new RegExp(search, 'i');
  //
  //   _.assign(selectors, {
  //     $or: [
  //       {firstName: regex},
  //       {lastName: regex}
  //     ]
  //   });
  // }

  // make object flattened -> depth = 1
  // let flattened = deepFlatten(matches);

  let flattened = [];
  _.forEach(matches, function (match) {
    flattened.push(flatten(match))
  });

  // parse json and get csv
  let csv = Papa.unparse(flattened);

  // send csv as file to download
  return this.response.end(csv);

}, {where: 'server'});

Router.route('/public/:filename', function () {
  const filename = this.params.filename;
  const query = this.params.query.static;
  const fullPath = path.join(process.cwd(), '../web.browser/app/static', filename);

  return findFile(this, filename, fullPath, query)
}, {where: 'server'});

Router.route('/public/screenshots/:filename', function () {
  const filename = this.params.filename;
  const query = this.params.query.static;
  const fullPath = path.join(process.cwd(), '../web.browser/app/static/screenshots', filename);

  return findFile(this, filename, fullPath, query)
}, {where: 'server'});

// Old routes, they redirect

Router.route('/files/:filename', function () {
  const query = this.params.query.static;
  let redirectUrl = 'https://www.snowdays.it/public/' + this.params.filename + (!_.isUndefined(query) ? '?q=' + query : '');

  this.response.writeHead(302, {
    'Location': redirectUrl
  });

  this.response.end();
}, {where: 'server'});

Router.route('/images/:filename', function () {
  const query = this.params.query.static;
  let redirectUrl = 'https://www.snowdays.it/public/' + this.params.filename + (!_.isUndefined(query) ? '?q=' + query : '');

  this.response.writeHead(302, {
    'Location': redirectUrl
  });

  this.response.end();
}, {where: 'server'});

function findFile(_this, filename, fullPath, query) {
  // get file extension
  const ext = path.extname(filename);
  let headers;

  try {

    // first try to read file
    // if ENOENT then catch 404
    const file = fs.readFileSync(fullPath);

    // check extension
    switch (ext) {

      // kind of hard coded: brochures are really big so ext = .jpg to distinguish
      case '.jpg':
        // if hash = static then do not include image in html file
        if (!_.isUndefined(query) && _.isEqual(query, 'true')) {
          _this.response.writeHead(200, {'Content-Type': 'image/jpg'});
          return _this.response.end(file, 'binary');
        } else {
          headers = {'Content-type': 'text/html'};
          _this.response.writeHead(200, headers);
          return _this.response.end('<html style="margin: 0"><head><title>" + filename + "</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous"></head><body class="container"><img style="width: 100%; height: auto;" src="data:image/jpeg;base64,' + new Buffer(file).toString('base64') + '"></body></html>');
        }
        break;

      case '.png':
        // if hash = static then do not include image in html file
        if (!_.isUndefined(query) && _.isEqual(query, 'true')) {
          _this.response.writeHead(200, {'Content-Type': 'image/png'});
          return _this.response.end(file, 'binary');
        } else {
          headers = {'Content-type': 'text/html'};
          _this.response.writeHead(200, headers);
          return _this.response.end('<html style="margin: 0"><head><title>" + filename + "</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous"></head><body class="container text-xs-center"><img style="width: auto; height: 100%;" src="data:image/png;base64,' + new Buffer(file).toString('base64') + '"></body></html>');
        }
        break;

      case '.pdf':
        headers = {'Content-type': 'application/pdf'};
        _this.response.writeHead(200, headers);
        return _this.response.end(file)
    }
  } catch (error) {
    if (_.isEqual(error.code, 'ENOENT')) {
      _this.response.writeHead(202, headers);
      return _this.response.end('<html><head><title>Snowdays error</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous"></head><body><div class="container"><div class="text-xs-center" style="margin-top: 50px" role="alert"><strong>404:</strong> File Not Found</div></div></body></html>');
    }
  }
}