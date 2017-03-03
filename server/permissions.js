import Participants from "/imports/collections/participants";
import Settings from "/imports/collections/settings";
import IDs from "/imports/collections/ids";
import Surveys from "/imports/collections/surveys";
import Events from "/imports/collections/events";

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
    return true
  },
  remove: function (userId, doc) {
    return true
  }
});

Settings.allow({
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

Events.allow({
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

// TODO: DB images permission