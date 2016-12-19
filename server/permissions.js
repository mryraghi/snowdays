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
    return true
  },
  update: function (userId, doc, fieldNames, modifier) {
    // allow iff is a contact persons and updating himself or sub participant
    return true
  },
  remove: function (userId, doc) {
    // allow iff is a contact persons and removing sub participant
    return true
  }
});

IDs.allow({
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

// TODO: DB images permission