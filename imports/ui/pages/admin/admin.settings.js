import "./admin.settings.html";
import Participants from "/imports/collections/participants";
import IDs from "/imports/collections/ids";


Template.AdminSettingsSection.onCreated(function () {
  Session.set('conflicts', []);
  this.subscribe('ids');
  this.subscribe('participants.all', {
    query: {},
    fields: {},
    limit: 10,
    sort: 1
  });

  let conflicts = [];

  Tracker.autorun(() => {
    if (this.subscriptionsReady()) {
      let participants = Participants.find().fetch();

      // iterate over each participant
      _.forEach(participants, function (p) {
        let isConflict = false;
        let newConflict = {
          _id: p._id,
          firstName: p.firstName,
          lastName: p.lastName,
          university: p.university
        };

        // get info from IDs collection
        let pIDonServer, pIDfilename, pID = IDs.findOne({$and: [{userId: p._id}, {'meta.type': 'personal'}]});
        let sIDonServer, sIDfilename, sID = IDs.findOne({$and: [{userId: p._id}, {'meta.type': 'student'}]});

        // parse filename
        if (pID && pID.path) pIDfilename = _.last(pID.path.split('/'));
        if (sID && sID.path) sIDfilename = _.last(sID.path.split('/'));

        // check if files are on the server
        if (pID && pIDfilename) pIDonServer = Meteor.call('id.exists', pIDfilename);
        if (sID && sIDfilename) sIDonServer = Meteor.call('id.exists', sIDfilename);

        // POSSIBLE CONFLICTS
        if (!(p.hasPersonalID && pID && pIDonServer)) {
          isConflict = true;
          newConflict['hasPID'] = p.hasPersonalID || false;
          newConflict['isPIDinCollection'] = pID || false;
          newConflict['pIDonServer'] = pIDonServer || false;
        }

        if (!(p.hasStudentID && sID && sIDonServer)) {
          isConflict = true;
          newConflict['hasSID'] = p.hasStudentID || false;
          newConflict['isSIDinCollection'] = sID || false;
          newConflict['sIDonServer'] = sIDonServer || false;
        }

        if (isConflict) conflicts.push(newConflict)
      });
      Session.set('conflicts', conflicts)
    }
  });
});

Template.AdminSettingsSection.onRendered(function () {

});

Template.AdminSettingsSection.helpers({
  conflicts: function () {
    return Session.get('conflicts')
  }
});