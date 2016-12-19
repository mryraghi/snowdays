import _ from 'lodash'

const API = new Restivus({
  useDefaultAuth: true,
  prettyJson: true,
  version: 'v1',
  onLoggedIn: function () {
    console.log(this.user.username + ' (' + this.userId + ') logged in');
  },
  onLoggedOut: function () {
    console.log(this.user.username + ' (' + this.userId + ') logged out');
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
 *   "data": [
 *     {
 *       _id: t4qD9ADQfRGfCcu6J,
 *       ...
 *     }
 *   ]
 * }
 */

/**
 * @api {get} /:collection?fields=profile&pageNumber=2&nPerPage=5 Get all
 * @apiName Collections
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Get all the documents in a collection.
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiParam {String} [fields='all'] Dictionary of fields to return
 * @apiParam {String} [pageNumber='1'] Number of results to skip at the beginning
 * @apiParam {String} [nPerPage] Maximum number of results to return
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
 * @api {get} /:collection/:id/?fields=profile&pageNumber=2&nPerPage=5 Get one
 * @apiName Collections
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Finds the first document that matches the selector
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiParam {String} [fields='all'] Dictionary of fields to return
 *
 * @apiSuccess (200 OK) {String} status="success" Status
 * @apiSuccess (200 OK) {Object} data Array of all participants
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
 * @api {post} /:collection Update
 * @apiName Collections
 * @apiGroup Collections
 * @apiVersion 0.0.1
 * @apiDescription Insert a document in the collection
 *
 * @apiHeader {String} X-Auth-Token User's unique login token
 * @apiHeader {String} X-User-Id User's '_id'
 *
 * @apiSuccess (200 OK) {String} status="success" Status
 * @apiSuccess (200 OK) {Object} data Array of all participants
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

API.addCollection(Meteor.users, {
  routeOptions: {
    authRequired: true
  },
  endpoints: {
    getAll: {
      action: function () {
        return find(Meteor.users, this.queryParams)
      }
    },
    get: {
      action: function () {
        return find(Meteor.users, this.queryParams, this.urlParams.id)
      }
    },
    post: {
      action: function () {

      }
    },
    delete: {}
  },
  excludedEndpoints: []
});

API.addCollection(Participants, {
  routeOptions: {
    authRequired: true
  },
  endpoints: {
    getAll: {
      action: function () {
        return find(Participants, this.queryParams)
      }
    },
    get: {
      action: function () {
        return find(Participants, this.queryParams, this.urlParams.id)
      }
    },
    post: {
      action: function () {
        return insert(Participants, this.bodyParams)
      }
    }
  }
});

function find(collection, queryParams, _id) {
  // getting query params
  const req_fields = queryParams.fields;
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
    return result(obj)
  }
}

function insert(collection, bodyParams) {
  if (_.isUndefined(bodyParams._id) && _.isUndefined(bodyParams.owner))
    return error('Either _id or owner must be defined');

  // check if bodyParams is valid before inserting
  let valid = Participants.simpleSchema().namedContext('API').validate(bodyParams);

  // if not valid throw an error
  if (!valid) return error('Body parameters not valid, check collection\'s schema');

  let _id = Participants.insert(bodyParams, function (err) {
    if (err) return error(error.message, error.code);
  });

  return result({_id: _id})
}

function result(data) {
  return {
    "status": "success",
    "data": data
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