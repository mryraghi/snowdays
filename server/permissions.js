import Participants from "/imports/collections/participants";
import Accommodations from "/imports/collections/accommodations";
import Settings from "/imports/collections/settings";
import IDs from "/imports/collections/ids";
import Surveys from "/imports/collections/surveys";
import Events from "/imports/collections/events";
import Reports from "/imports/collections/reports";
import MatchingResults from "/imports/collections/matchingresults"; 

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

Accommodations.allow({
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

Reports.allow({
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

MatchingResults.allow({
  insert: function ( doc) {
    return true
  },
  update: function ( doc, fieldNames, modifier) {
    return true
  },
  remove: function ( doc) {
    return true
  }
});

// TODO: DB images permission