const path = Npm.require('path');
const fs = Npm.require('fs');
const _ = Npm.require('lodash');
const Papa = Npm.require('papaparse');
import base64url from 'base64url'
import jwt from 'jsonwebtoken'
import {deepFlatten, deepPick, deepFind} from '/lib/js/utilities'

import Participants from '/imports/collections/participants'


Router.route('/csv/:token', function () {
  let _this = this;

  let decoded;

  try {
    decoded = jwt.verify(this.params.token, 'secret');
  } catch (error) {
    if (error) {
      headers = {'Content-type': 'text/html'};
      this.response.writeHead(200, headers);
      return this.response.end('<html><head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous"></head><body><div class="container"><div class="text-xs-center" style="margin-top: 50px" role="alert"><strong>' + error.name + '</strong> ' + error.message + '</div></div></body></html>');
    }
  }


  let filename = decoded.filename + '.csv';
  let query = decoded.query;
  let fields = decoded.fields;
  let download = decoded.download;
  let collection = {};

  this.response.writeHead(200, {
    'Content-type': 'text/csv',
    'Content-Disposition': "attachment; filename =" + filename
  });

  if (_.isEqual(download, 'all')) collection = Participants.find().fetch();
  else collection = Participants.find(query, {fields: fields}).fetch();

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
  let flattened = deepFlatten(collection);

  console.log(flattened, collection);

  // parse json and get csv
  let csv = Papa.unparse(flattened);

  // send csv as file to download
  return this.response.end(csv);

}, {where: 'server'});