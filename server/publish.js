Meteor.publish('currentUserData', function () {
  return Meteor.users.find({_id: this.userId}, {fields: {createdAt: 1, survey: 1, profile: 1}});
});

Meteor.publish('participantsData', function () {
  if (Roles.userIsInRole(this.userId, ['contact-person'])) {
    return Participants.find({$or: [{_id: this.userId}, {owner: this.userId}]});
  } else this.stop();
});

Meteor.publish('relatedParticipantsData', function () {
  // return Meteor.users.find({owner: this.userId});
});