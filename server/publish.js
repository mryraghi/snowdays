import Participants from "/imports/collections/participants";
import IDs from "/imports/collections/ids";
import Events from "/imports/collections/events";
import Reports from "/imports/collections/reports";
import Flixbus from "/imports/collections/flixbus";
import _ from "lodash";

Meteor.publish('users.current', function (token) {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId}, {fields: {createdAt: 1, survey: 1, profile: 1}});
  } else if (!_.isUndefined(token)) {
    return Meteor.users.find({'profile.token': token}, {
      fields: {
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.university': 1
      }
    });
  } else {
    // return nothing if user is not logged in
    // and no token is provided
    this.stop()
  }
});

Meteor.publish('participants.current', function (_id) {
  if (_id) {
    this.ready(() => {
      console.log('participants.current READY: ' + _id)
    });

    this.onStop(() => {
      console.log('participants.current STOP: ' + _id)
    });

    return Participants.find({_id: _id});
  } else this.stop()
});

Meteor.publish('participants.all.related', function () {
  return Participants.find({$or: [{_id: this.userId}, {owner: this.userId}]});
});

Meteor.publish('participants.all', function (options) {
  this.ready(() => {
    console.log('participants.all READY')
  });

  this.onStop(() => {
    console.log('participants.all STOP')
  });

  return Participants.find(options.query, {
    fields: options.fields,
    limit: options.limit,
    skip: options.skip,
    sort: options.sort
  })
});

/**
 * INTERNAL: PARTICIPANT
 */
Meteor.publish('participant.internal', function (_id) {
  return Participants.find(_id)
});

/**
 * INTERNAL: USER
 */
Meteor.publish('user.internal', function (_id) {
  return Meteor.users.find({"profile.participantId": _id})
});

/**
 * INTERNAL: TOKEN
 */
Meteor.publish('token.internal', function (token) {
  return Meteor.users.find({"services.email.verificationTokens[0]": token})
});

/**
 * INTERNAL: HELPER STATS
 */
Meteor.publish('stats.helpers.internals', function () {
  return Participants.find({
    university: 'Free University of Bolzano',
    isHelper: true,
    helperCategory: {$exists: true}
  }, {
    fields: {
      helperCategory: 1
    }
  })
});

/**
 * INTERNAL: DORMS STATS
 */
Meteor.publish('stats.dorms.internals', function () {
  return Participants.find({
    university: 'Free University of Bolzano',
    isHost: true,
    accommodationType: 'dorm'
  }, {
    fields: {
      studentDorm: 1
    }
  })
});

/**
 * INTERNAL: COUNT
 */
Meteor.publish('count.internals', function (_id) {
  return Participants.find({university: 'Free University of Bolzano'}, {fields: {_id: 1}})
});

/**
 * INTERNAL: HELPER STATS
 */
Meteor.publish('stats.internals.helpers', function (_id) {
  return Participants.find(_id)
});

Meteor.publish('participants', function () {
  return Participants.find()
});

Meteor.publish('users', function () {
  return Meteor.users.find()
});

Meteor.publish('ids', function () {
  return IDs.find().cursor
});

Meteor.publish('users.all', function (options) {
  this.ready(() => {
    console.log('users.all READY: ')
  });

  this.onStop(() => {
    console.log('users.all STOP: ')
  });

  // console.log(options);
  return Meteor.users.find(options.query, {fields: options.fields, limit: options.limit, skip: options.skip})
});

Meteor.publish('reports.all', function () {
  this.ready(() => {
    console.log('reports.all READY: ')
  });

  this.onStop(() => {
    console.log('reports.all STOP: ')
  });

  return Reports.find()
});

Meteor.publish('stats.users.all', function () {
  // console.log(Meteor.users.find().fetch());
  return Meteor.users.find()
});

Meteor.publish('stats.participants.all', function () {
  // console.log(Participants.find().fetch());
  return Participants.find()
});

Meteor.publish('users.one.strict', function (_id) {
  return Meteor.users.find({_id: _id}, {
    fields: {
      'profile.firstName': 1,
      'profile.lastName': 1,
      'profile.university': 1
    }
  })
});

Meteor.publish('users.one', function (_id) {
  if (_id) {
    this.ready(() => {
      console.log('users.one READY: ' + _id)
    });

    this.onStop(() => {
      console.log('users.one STOP: ' + _id)
    });

    return Meteor.users.find({_id: _id})
  } else this.stop()
});

Meteor.publish('ids.both', function (_id) {
  if (_id) {
    this.ready(() => {
      console.log('ids.both READY: ' + _id)
    });

    this.onStop(() => {
      console.log('ids.both STOP: ' + _id)
    });

    return IDs.find({$or: [{$and: [{'userId': _id}, {'meta.userId': {$exists: false}}]}, {'meta.userId': _id}]}).cursor
  } else this.stop()
});

Meteor.publish('events.all', function () {
  return Events.find()
});

Meteor.publish('events.one', function (_id) {
  return Events.find(_id)
});

Meteor.publish('flixbus.all', function () {
  return Flixbus.find()
});

// Meteor.publish('files.ids.all', function () {
//   return IDs.find().cursor;
// });