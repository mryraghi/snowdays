import _ from "lodash";
import Participants from "/imports/collections/participants";
import Events from "/imports/collections/events";
import Reports from "/imports/collections/reports";
import {flatten} from "/lib/js/utilities";
const path = Npm.require('path');
const fs = Npm.require('fs');

const CryptoJS = require("crypto-js");

let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  server_name: 'snowdays',
  tags: {section: 'API'}
});

// todo: check if updated value is already set and return error

// catches all exceptions on the server
//raven.patchGlobal(client);

client.on('logged', function () {
  console.log('Exception handled and sent to Sentry.io');
});

client.on('error', function (e) {
  // The event contains information about the failure:
  //   e.reason -- raw response body
  //   e.statusCode -- response status code
  //   e.response -- raw http response object
  console.log(e);

  console.log('Couldn\'t connect to Sentry.io');
});

let API = new Restivus({
  useDefaultAuth: true,
  prettyJson: true,
  version: 'v1',
  onLoggedIn: function () {
    captureMessage(this.user.username + ' logged in', {}, 'info', this.user);
  },
  onLoggedOut: function () {
    captureMessage(this.user.username + ' logged out', {}, 'info', this.user);
  }
});


/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup Accounts
 * @apiVersion 0.0.1
 *
 * @apiParam (Form URL-Encoded) {String} username Username
 * @apiParam (Form URL-Encoded) {String} password Password
 *
 * @apiSuccess (200 OK) {String} status="success"
 * @apiSuccess (200 OK) {Object} data
 * @apiSuccess (200 OK) {String} data.authToken Unique login access token
 * @apiSuccess (200 OK) {String} data.userId User's _id
 *
 * @apiSuccessExample {json} Success response
 * {
 *   "status": "success",
 *   "data": {
 *      "authToken": "l5rTxmHlXs0UzRxz-E_fIFFYi2oIyNcikQ-6c_LlbC5",
 *      "userId": "t4qD9ADQfRGfCcu6J"
 *   }
 * }
 *
 * @apiError {String} status="error"
 * @apiError {String} message Error message
 *
 * @apiErrorExample {json} Error response
 * {
 *   "status": "error",
 *   "message": "Unauthorized"
 * }
 */

/**
 * @api {post} /logout Logout
 * @apiName Logout
 * @apiGroup Accounts
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiSuccess (200 OK) {String} status Success
 * @apiSuccess (200 OK) {Object} data Array of all participants
 *
 * @apiSuccessExample {json} Success response
 * {
 *   "status": "success",
 *   "data": {
 *     "message": "You've been logged out!"
 *   }
 * }
 *
 * @apiError {String} status="error"
 * @apiError {String} message Error message
 *
 * @apiErrorExample {json} Error response
 * {
 *   "status": "error",
 *   "message": "You must be logged in to do this."
 * }
 */

/**
 * @api {get} /:collection Get all
 * @apiName Get all
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Get all the documents in a collection.
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiParam (URL parameters) {String} [fields='all'] Dictionary of fields to return
 * @apiParam (URL parameters) {String} [value] Value to be matched with the first field provided
 * @apiParam (URL parameters) {String} [pageNumber='1'] Number of results to skip at the beginning
 * @apiParam (URL parameters) {String} [nPerPage] Maximum number of results to return
 *
 * @apiSuccess (200 OK) {String} status="success" Status
 * @apiSuccess (200 OK) {Object} data Array of all participants
 *
 * @apiSuccessExample Success response
 * {
 *   "status": "success",
 *   "data": [
 *     {
 *       _id: t4qD9ADQfRGfCcu6J,
 *       ...
 *     },
 *     {
 *       ...
 *     }
 *   ]
 * }
 *
 * @apiError (401 Unauthorized) {String} status="error"
 * @apiError (401 Unauthorized) {String} message Error message
 *
 * @apiErrorExample {json} Error response
 * {
 *   "status": "error",
 *   "message": "You must be logged in to do this."
 * }
 */

/**
 * @api {get} /:collection/:id/?fields=externals&pageNumber=2&nPerPage=5 Get one
 * @apiName Get one
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Finds the first document that matches the selector.
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiParam (URL parameters) {String} [fields='all'] Dictionary of fields to return
 *
 * @apiSuccess (200 OK) {String} status="success" Status
 * @apiSuccess (200 OK) {Object} data Participant's data
 *
 * @apiSuccessExample Success response
 * {
 *   "status": "success",
 *   "data": {
 *     _id: t4qD9ADQfRGfCcu6J,
 *     ...
 *   }
 * }
 *
 * @apiError (401 Unauthorized) {String} status="error"
 * @apiError (401 Unauthorized) {String} message Error message
 *
 * @apiErrorExample {json} Error response
 * {
 *   "status": "error",
 *   "message": "You must be logged in to do this."
 * }
 */

/**
 * @api {put} /:collection/:id Update one
 * @apiName Update one
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Modify one document in the collection.
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiParam (Body parameter) {String} key Set collection's key
 *
 * @apiSuccess (200 OK) {String} status="success" Status
 * @apiSuccess (200 OK) {Object} data Empty object
 *
 * @apiSuccessExample Success response
 * {
 *   "status": "success",
 *   "data": {}
 * }
 *
 * @apiError (400 Bad Request) {String} status="error"
 * @apiError (400 Bad Request) {String} message Error message
 *
 * @apiErrorExample {json} Error response (400 Bad Request)
 * {
 *   "status": "error",
 *   "message": "randomKey is not allowed by the schema"
 * }
 *
 * @apiError (401 Unauthorized) {String} status="error"
 * @apiError (401 Unauthorized) {String} message Error message
 *
 * @apiErrorExample {json} Error response (401 Unauthorized)
 * {
 *   "status": "error",
 *   "message": "You must be logged in to do this."
 * }
 */

// API.addCollection(Meteor.users, {
//   routeOptions: {
//     // authRequired: true
//   },
//   endpoints: {
//     getAll: {
//       action: function () {
//         let response = find(Meteor.users, this.queryParams);
//
//         captureMessage('GET All Users', {
//           endpoint: 'getAll',
//           collection: 'Users',
//           urlParams: this.urlParams,
//           queryParams: this.queryParams,
//           bodyParams: this.bodyParams,
//           response: response
//         }, 'info', this.user);
//
//         return response;
//       }
//     },
//     get: {
//       action: function () {
//         let response = find(Meteor.users, this.queryParams, this.urlParams.id);
//
//         captureMessage('GET User', {
//           endpoint: 'get',
//           collection: 'Users',
//           urlParams: this.urlParams,
//           queryParams: this.queryParams,
//           bodyParams: this.bodyParams,
//           response: response
//         }, 'info', this.user);
//
//         return response
//       }
//     }
//   },
//   excludedEndpoints: ['put', 'post', 'delete']
// });

API.addCollection(Participants, {
  routeOptions: {
    authRequired: true
  },
  endpoints: {
    getAll: {
      action: function () {
        let response = find(Participants, this.queryParams);

        captureMessage('GET All Participants', {
          endpoint: 'getAll',
          collection: 'Participants',
          urlParams: this.urlParams,
          queryParams: this.queryParams,
          bodyParams: this.bodyParams,
          response: response
        }, 'info', this.user);

        return response;
      }
    },
    get: {
      action: function () {
        let response = find(Participants, this.queryParams, this.urlParams.id);

        captureMessage('GET Participant', {
          endpoint: 'get',
          collection: 'Participants',
          urlParams: this.urlParams,
          queryParams: this.queryParams,
          bodyParams: this.bodyParams,
          response: response
        }, 'info', this.user);

        return response;
      }
    },
    post: {
      action: function () {
        let _this = this;

        // TODO: check university field

        // check whether related owner or user exists
        let u = Meteor.users.findOne({$or: [{_id: this.bodyParams._id}, {_id: this.bodyParams.owner}]});
        if (!u) {
          let response = err('No related owner or user exist with this _id');

          captureMessage('POST Participant', {
            endpoint: 'post',
            collection: 'Participants',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'warning', this.user);

          return response
        }

        if (_.isUndefined(this.bodyParams._id) && _.isUndefined(this.bodyParams.owner)) {
          let response = err('Either _id or owner must be defined');

          captureMessage('POST Participant', {
            endpoint: 'post',
            collection: 'Participants',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'warning', this.user);

          return response
        }

        // check if bodyParams is valid before inserting
        try {
          Participants.simpleSchema().validate(this.bodyParams);
        } catch (error) {
          // if not valid throw an error
          let response = err(error.message);

          captureMessage('POST Participant', {
            endpoint: 'post',
            collection: 'Participants',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'warning', this.user);

          return response
        }

        // check for owner existence
        if (!_.isUndefined(this.bodyParams.owner)) {
          let owner = Meteor.users.findOne({_id: this.bodyParams.owner});
          if (_.isUndefined(owner)) {
            let response = err('Owner field doesn\'t match any user');

            captureMessage('POST Participant', {
              endpoint: 'post',
              collection: 'Participants',
              urlParams: _this.urlParams,
              queryParams: _this.queryParams,
              bodyParams: _this.bodyParams,
              response: response
            }, 'warning', this.user);

            return response
          }
        }


        let _id = Participants.insert(this.bodyParams, function (error) {
          if (error) {
            let response = err(error.message, error.code);

            captureMessage('POST Participant', {
              endpoint: 'post',
              collection: 'Participants',
              urlParams: _this.urlParams,
              queryParams: _this.queryParams,
              bodyParams: _this.bodyParams,
              response: response
            }, 'warning', _this.user);

            return response
          }
        });

        // otherwise
        let response = res({_id: _id}, 201);

        captureMessage('POST Participant', {
          endpoint: 'post',
          collection: 'Participants',
          urlParams: this.urlParams,
          queryParams: this.queryParams,
          bodyParams: this.bodyParams,
          response: response
        }, 'info', this.user);

        return response;
      }
    },
    put: {
      action: function () {
        let _id = this.urlParams.id;
        let _this = this;

        // select fields
        // converts valid boolean strings to booleans
        let fields = _.mapValues(this.bodyParams, function (value) {
          return 1
        });

        // check if _id exists
        let p = Participants.findOne({_id: _id}, {fields: fields});
        if (!p) {
          let response = err('No participant exist with this _id');

          captureMessage('PUT Participant', {
            endpoint: 'put',
            collection: 'Participants',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'warning', this.user);

          return response
        }

        // converts valid boolean strings to booleans
        let params = _.mapValues(this.bodyParams, function (value) {
          if (value == 'true') return true;
          if (value == 'false') return false;
          return value
        });

        params._id = _id;

        // check if bodyParams is valid before inserting
        try {
          Participants.simpleSchema().validate(params);
        } catch (error) {
          // if not valid throw an error
          let response = err(error.reason);

          captureMessage('PUT Participant', {
            endpoint: 'put',
            collection: 'Participants',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'warning', this.user);

          return response
        }

        // check previous participant state
        if (_.isEqual(flatten(p), params)) return err('Value already set!');

        let matchedDocs = Participants.update({_id: _id}, {$set: params});

        if (_.isEqual(matchedDocs, 1)) {
          let response = res('Participant updated');

          captureMessage('PUT Participant', {
            endpoint: 'put',
            collection: 'Participants',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'info', _this.user);

          return response
        }

        // otherwise return basic
        return err('Value already set!')
      }
    }
  }
});

API.addRoute('cards', {authRequired: true}, {
  get: function () {
    let allEvents = this.queryParams.events;

    // if /cards?events=all
    if (!_.isUndefined(allEvents) && _.isEqual(allEvents, 'all')) {
      return res(Events.find({"checkRequired": true}, {fields: {css: 0, description: 0, showInSchedule: 0}}).fetch())
    } else {
      // get requester _id
      let role = Roles.getRolesForUser(this.userId)[0];

      let events = Events.find({
        $and: [{
          $where: function () {
            // considering 2 hours of margin before the event starts
            let startDate = this.startDate.setHours(this.startDate.getHours() - 2);

            // considering 2 hours of margin after the event ends
            let endDate = this.endDate.setHours(this.endDate.getHours() + 2);

            // getting the current date
            // todo: double check timezones
            let currentDate = new Date();

            // return docs with current date between start and end dates
            return currentDate > startDate && currentDate < endDate;
          }.toString() // workaround for the function and $where op to work in Meteor
        }, {"checkRequired": true}]
      }, {fields: {css: 0}}).fetch();

      return res(events)
    }
  }
});

API.addCollection(Reports, {
  routeOptions: {
    authRequired: true
  },
  endpoints: {
    post: {
      action: function () {
        let message = this.bodyParams.message;
        let userId = this.userId;
        let _this = this;

        if (_.isUndefined(message)) return err('Field \'message\' is required');

        // this.bodyParams
        this.bodyParams.userId = userId;

        let _id = Reports.insert(this.bodyParams, function (error) {
          if (error) {
            let response = err(error.message, error.code);

            captureMessage('POST Reports', {
              endpoint: 'post',
              collection: 'Reports',
              urlParams: _this.urlParams,
              queryParams: _this.queryParams,
              bodyParams: _this.bodyParams,
              response: response
            }, 'warning', _this.user);

            return response
          }
        });

        if (_id) {
          // otherwise
          let response = res('Report has been sent', 201);

          captureMessage('POST Reports', {
            endpoint: 'post',
            collection: 'Reports',
            urlParams: _this.urlParams,
            queryParams: _this.queryParams,
            bodyParams: _this.bodyParams,
            response: response
          }, 'info', _this.user);

          return response;
        }
      }
    }
  }
});

function find(collection, queryParams, _id) {
  // getting query params
  const req_fields = queryParams.fields;
  const req_pageNumber = _.toInteger(queryParams.pageNumber);
  const req_nPerPage = _.toInteger(queryParams.nPerPage);
  let req_value = queryParams.value;

  // returned object
  let obj;

  // removes white spaces and parses fields into array
  const params = _.replace(req_fields, ' ', '').split(',');

  // parse value
  if (_.isNumber(req_value)) req_value = _.toInteger(req_value);
  if (req_value === 'true') req_value = true;
  if (req_value === 'false') req_value = false;

  let query = {};
  if (!_.isUndefined(req_value) && !_.isEqual(params[0], 'all')) query[params[0]] = req_value;
  if (!_.isUndefined(_id)) query['_id'] = _id;

  // calculates how many docs to skip
  const skip = req_pageNumber > 0 ? ((req_pageNumber - 1) * req_nPerPage) : 0;

  // map array to 'key: 1' in obj
  let fields = {};
  if (!_.isEqual(req_fields, 'all')) {
    fields = _.zipObject(params, _.map(params, function () {
      return 1
    }));
  }

  // firstName, lastName and other fields requested
  let baseFields = _.assignIn({firstName: 1, lastName: 1}, fields);

  // todo: double check!!
  if (_.isUndefined(_id)) {
    // returns array of objects
    obj = collection.find(query, {
      fields: (_.isEqual(req_fields, 'all') ? {} : baseFields),
      skip: skip,
      limit: req_nPerPage
    }).fetch();
  } else {
    // findOne returns the object alone an not in an array
    obj = collection.findOne(query, {
      fields: (_.isEqual(req_fields, 'all') ? {} : baseFields),
      skip: skip,
      limit: req_nPerPage
    });
  }

  // there is no way of checking whether a key exists
  // return requested valid fields only
  return res(obj);
}

function res(data, code = 200) {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      "status": "success",
      "data": data
    }
  }
}

function err(message, code = 400) {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      "status": "error",
      "message": message
    }
  }
}

function captureMessage(message, tags = {}, level, user) {
  client.setContext({
    user: user
  });
  client.captureMessage('[API] ' + message, {
    user: {
      id: user._id,
      username: user.username
    },
    level: level,
    extra: tags
  });
}