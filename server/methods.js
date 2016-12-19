Meteor.methods({
  'update.participant': function (_id, participant) {
    check(_id, String);
    return Participants.update(_id, {$set: participant});
  }
});
