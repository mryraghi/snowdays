import Participants from "/imports/collections/participants";
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
  return Participants.find({_id: _id});
});

Meteor.publish('participants.all.related', function () {
  return Participants.find({$or: [{_id: this.userId}, {owner: this.userId}]});
});

Meteor.publish('participants.all', function (options) {
  // console.log(options);
  return Participants.find(options.query, {fields: options.fields, limit: options.limit, skip: options.skip})
});

Meteor.publish('users.all', function (options) {
  // console.log(options);
  return Meteor.users.find(options.query, {fields: options.fields, limit: options.limit, skip: options.skip})
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


// Meteor.publish('files.ids.all', function () {
//   return IDs.find().cursor;
// });