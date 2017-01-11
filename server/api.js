import _ from 'lodash'

const CryptoJS = require("crypto-js");

import Participants from '/imports/collections/participants'

let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  server_name: 'snowdays',
  tags: {section: 'API'}
});

// catches all exceptions on the server
raven.patchGlobal(client);

client.on('logged', function () {
  console.log('Exception handled and sent to Sentry.io');
});

client.on('error', function (e) {
  // The event contains information about the failure:
  //   e.reason -- raw response body
  //   e.statusCode -- response status code
  //   e.response -- raw http response object

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
 * @api {get} /:collection?fields=profile&pageNumber=2&nPerPage=5 Get all
 * @apiName Get all
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Get all the documents in a collection.
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiParam (URL parameters) {String} [fields='all'] Dictionary of fields to return
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
 *
 * @apiExample {json} Participants' schema
 const Schemas = {};

 Schemas.DayOne = new SimpleSchema({
  bus1: {
    type: Boolean,
    defaultValue: false,
    label: "Day 1 Bus 1",
    optional: true
  },
  bus2: {
    type: Boolean,
    defaultValue: false,
    label: "Day 1 Bus 2",
    optional: true
  }
});

 Schemas.DayTwo = new SimpleSchema({
  bus1: {
    type: Boolean,
    defaultValue: false,
    label: "Day 2 Bus 1",
    optional: true
  },
  bus2: {
    type: Boolean,
    defaultValue: false,
    label: "Day 2 Bus 2",
    optional: true
  },
  activity: {
    type: String,
    label: "Day 2 activity",
    optional: true
  },
  rental: {
    type: Boolean,
    defaultValue: false,
    label: "Day 2 rental",
    optional: true
  },
  race: {
    type: Boolean,
    defaultValue: false,
    label: "Day 2 race",
    optional: true
  },
  course: {
    type: Boolean,
    defaultValue: false,
    label: "Day 2 course",
    optional: true
  }
});

 Schemas.DayThree = new SimpleSchema({
  bus1: {
    type: Boolean,
    defaultValue: false,
    label: "Day 3 Bus 1",
    optional: true
  },
  bus2: {
    type: Boolean,
    defaultValue: false,
    label: "Day 3 Bus 2",
    optional: true
  }
});

 Schemas.Bank = new SimpleSchema({
  beneficiary: {
    type: String,
    label: "Beneficiary",
    optional: true
  },
  IBAN: {
    type: String,
    label: "IBAN",
    optional: true
  },
  name: {
    type: String,
    label: "Name Bank",
    optional: true
  },
  swift_bic: {
    type: String,
    label: "SWIFT/BIC",
    optional: true
  }
});

 Schemas.Info = new SimpleSchema({
  address: {
    type: String,
    label: "Your address",
    optional: true
  },
  city: {
    type: String,
    label: "Your city",
    optional: true
  },
  zip: {
    type: Number,
    label: "Your zip code",
    optional: true
  },
  province: {
    type: String,
    label: "Your province",
    optional: true
  },
  country: {
    type: String,
    label: "Your country",
    optional: true
  }
});

 Schemas.Birth = new SimpleSchema({
  date: {
    label: 'Birth date',
    type: String,
    regEx: /\d{2}(\\)\d{2}(\\)\d{4}/,
    optional: true
  },
  country: {
    label: "Country of birth",
    type: String,
    max: 40,
    optional: true
  }
});

 Schemas.Participant = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  firstName: {
    type: String,
    max: 25,
    optional: true
  },
  lastName: {
    type: String,
    max: 25,
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    optional: true
  },
  university: {
    type: String,
    optional: true
  },
  accommodation: {
    type: String,
    optional: true
  },
  host: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },
  info: {
    type: Schemas.Info,
    optional: true
  },
  birth: {
    type: Schemas.Birth,
    optional: true
  },
  bank: {
    type: Schemas.Bank,
    optional: true
  },
  dayOne: {
    type: Schemas.DayOne,
    optional: true
  },
  dayTwo: {
    type: Schemas.DayTwo,
    optional: true
  },
  dayThree: {
    type: Schemas.DayThree,
    optional: true
  },
  checkedIn: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  isVolleyPlayer: {
    label: 'isVolleyPlayer',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasPersonalID: {
    label: 'hasPersonalID',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  hasStudentID: {
    label: 'hasStudentID',
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  foodAllergies: {
    type: String,
    optional: true
  },
  tshirt: {
    label: 'T-shirt',
    type: String,
    allowedValues: ['S', 'M', 'L'],
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
    optional: true
  }
});
 *
 *
 * @apiExample {json} Users' schema
 Schema = {};

 Schema.UserProfile = new SimpleSchema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  birthday: {
    type: Date,
    regEx: /\d{2}(\\)\d{2}(\\)\d{4}/,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },
  university: {
    type: String,
    label: "University",
    optional: true
  },
  team_volley: {
    type: Boolean,
    optional: true
  },
  allowed_participants: {
    type: Number
  }
});

 Schema.User = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  username: {
    type: String
  },
  emails: {
    type: Array,
    optional: true
  },
  "emails.$": {
    type: Object
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date,
    defaultValue: new Date()
  },
  profile: {
    type: Schema.UserProfile
  },
  roles: {
    type: Array,
    optional: true
  },
  'roles.$': {
    type: String
  }
});
 */

/**
 * @api {get} /:collection/:id/?fields=profile&pageNumber=2&nPerPage=5 Get one
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

API.addCollection(Meteor.users, {
  routeOptions: {
    authRequired: true
  },
  endpoints: {
    getAll: {
      action: function () {
        let response = find(Meteor.users, this.queryParams);

        captureMessage('GET All Users', {
          endpoint: 'getAll',
          collection: 'Users',
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
        let response = find(Meteor.users, this.queryParams, this.urlParams.id);

        captureMessage('GET User', {
          endpoint: 'get',
          collection: 'Users',
          urlParams: this.urlParams,
          queryParams: this.queryParams,
          bodyParams: this.bodyParams,
          response: response
        }, 'info', this.user);

        return response
      }
    }
  },
  excludedEndpoints: ['put', 'post', 'delete']
});

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

        // TODO: check univiersity field

        // check whether related owner or user exists
        let u = Meteor.users.findOne({$or: [{_id: this.bodyParams._id}, {_id: this.bodyParams.owner}]});
        if (!u) {
          let response = error('No related owner or user exist with this _id');

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
          let response = error('Either _id or owner must be defined');

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
        } catch (e) {
          // if not valid throw an error
          let response = error(e.message);

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
            let response = error('Owner field doesn\'t match any user');

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


        let _id = Participants.insert(this.bodyParams, function (err) {
          if (err) {
            let response = error(error.message, error.code);

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

        // check if _id exists
        let p = Participants.findOne({_id: _id});
        if (!p) {
          let response = error('No participant exist with this _id');

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
        } catch (e) {
          // if not valid throw an error
          let response = error(e.reason);

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
          }, 'info', this.user);

          return response
        }

        // otherwise return basic
        return res('Value already set, nothing updated')
      }
    }
  }
})
;

function find(collection, queryParams, _id) {
  // getting query params
  const req_fields = queryParams.fields || 'all';
  const req_pageNumber = _.toInteger(queryParams.pageNumber);
  const req_nPerPage = _.toInteger(queryParams.nPerPage);

  // returned object
  let obj;

  // check whether all or just few fields are requested
  if (_.isEqual(req_fields, 'all')) {
    return collection.find().fetch()
  } else {

    // calculates how many documents to skip
    const skip = req_pageNumber > 0 ? ((req_pageNumber - 1) * req_nPerPage) : 0;

    // removes white spaces and parses fields into array
    const params = req_fields.replace(" ", "").split(',');

    // map array to 'key: 1' in obj
    const fields = _.zipObject(params, _.map(params, function () {
      return 1
    }));

    if (_.isUndefined(_id)) {
      // if selector is undefined then return all objects
      obj = collection.find({}, {
        fields: fields,
        skip: skip,
        limit: req_nPerPage
      }).fetch();
    } else {
      // otherwise return just one object
      obj = collection.findOne({_id: _id}, {
        fields: fields
      });
    }

    // there is no way of checking whether a key exists
    // return requested valid fields only
    return res(obj)
  }
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

function error(message, code = 400) {
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