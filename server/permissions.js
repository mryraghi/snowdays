Meteor.users.allow({
  insert: function (userId, doc) {
    return true
  },
  update: function (userId, doc, fieldNames, modifier) {
    return true
  },
  remove: function (userId, doc) {
    return true
  }
});

Participants.allow({
  insert: function (userId, doc) {
    // allow iff is a contact persons and adding himself or sub participant
    return !!((_.isEqual(userId, doc._id) || _.isEqual(userId, doc.owner))
    && (Roles.userIsInRole(userId, ['contact-person'])))
  },
  update: function (userId, doc, fieldNames, modifier) {
    // allow iff is a contact persons and updating himself or sub participant
    return !!((_.isEqual(userId, doc._id) || _.isEqual(userId, doc.owner))
    && (Roles.userIsInRole(userId, ['contact-person'])));
  },
  remove: function (userId, doc) {
    // allow iff is a contact persons and removing sub participant
    return !!((_.isEqual(userId, doc.owner)) && (Roles.userIsInRole(userId, ['contact-person'])));
  }
});

Surveys.allow({
  insert: function (userId, doc) {
    return true
  },
  update: function (userId, doc, fieldNames, modifier) {
    return !!(Roles.userIsInRole(userId, ['contact-person']))
  },
  remove: function (userId, doc) {
    return true
  }
});