Meteor.publish('currentUserData', function () {
  return Meteor.users.find({_id: this.userId}, {fields: {createdAt: 1, survey: 1, profile: 1}});
});

Meteor.publish('participantsData', function () {
  return Participants.find({$or: [{_id: this.userId}, {owner: this.userId}]});
});

Meteor.publish('relatedParticipantsData', function () {
  // return Meteor.users.find({owner: this.userId});
});

Meteor.publish('singlePublicParticipant', function (_id) {
  return Participants.find(_id);
});

Meteor.publish('files.ids.all', function () {
  return IDs.find().cursor;
});