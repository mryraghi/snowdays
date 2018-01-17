let CryptoJS = require("crypto-js");
let fs = require('fs');
let path = Npm.require('path');
import moment from 'moment';
import Events from "/imports/collections/events";
import _ from "lodash";
import base64url from "base64url";
import {checkMasterPassword, unflatten} from "./utilities";
import Participants from "/imports/collections/participants";
import IDs from "/imports/collections/ids";
import Settings from "/imports/collections/settings";

Meteor.methods({
  'participants.internals.limit': function () {
    let maxNotReached = Participants.find({university: 'Free University of Bolzano'}).count() <= 350;
    let internalEnrolment = moment().isBetween('2018-01-01', '2018-01-21');
    return maxNotReached && internalEnrolment
  },
  'sendVerificationLink': function () {
    let userId = Meteor.userId();
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
  },

  // participants
  'participants.insert': function (participant) {
    let user = Meteor.user();
    let isExternal = Roles.userIsInRole(user._id, 'external');

    // if external then
    if (isExternal) {

      // throw error if user has no token
      if (_.isUndefined(user.profile) || _.isUndefined(user.profile.token))
        throw new Meteor.Error('participants.insert', 'Token not found in user\'s schema');

      // double check that limit has not been reached
      let count = Participants.find({_id: {$ne: this.userId}}).count();

      // throw error if participants limit has been reached
      if (_.isEqual(count, Meteor.user().profile.allowedParticipants))
        throw new Meteor.Error('participants.insert', 'Participants limit reached');

      // generate _id
      let _id = Random.id();

      // get token from contact person
      let token = user.profile.token;

      // encrypt _id with token
      let encrypted = CryptoJS.AES.encrypt(_id, token);

      // add properties to participant's object
      participant._id = _id;
      participant['token'] = base64url.encode(encrypted.toString());
    }

    // insert participant
    return Participants.insert(participant);
  },
  'participants.update': function (participant) {
    let p = Participants.findOne(participant._id);

    // create new one if it doesn't exist
    if (_.isUndefined(p)) {
      return Participants.insert(participant);
    }

    return Participants.update(participant._id, {
      $set: participant
    });
  },
  'admin.participants.update': function (participant) {
    let p = Participants.findOne(participant._id);
    if (_.isUndefined(p)) throw new Meteor.Error('participants.update', 'No related participant exists');

    // since Mongo throw errors for fucking every update
    // then retrieve previous state of deep object
    // and substitute new value
    let oldParticipant = Participants.findOne({_id: participant._id});
    // to avoid mongo error remove createdAt property
    delete oldParticipant.createdAt;
    let newParticipant = _.merge(oldParticipant, unflatten(participant));
    return Participants.update(participant._id, {
      $set: newParticipant
    });
  },
  'participants.remove': function (_id) {
    let relatedUser = Meteor.users.find({_id: _id});
    if (relatedUser) Meteor.users.remove({_id: _id});

    let relatedSettings = Settings.findOne({_id: _id});
    if (relatedSettings) Settings.remove({_id: _id});
    return Participants.remove(_id);
  },

  'participants.count': function (options) {
    return Participants.find(options.query, {fields: options.fields, limit: options.limit, skip: options.skip}).count()
  },

  'participants.fields': function (_id, fields) {
    return Participants.findOne({_id: _id}, {fields: fields})
  },

  'participants.related': function (owner, _id) {
    return Participants.find({
      "owner": {$exists: true},
      $and: [{"owner": owner}, {$and: [{"_id": {$ne: _id}}]}]
    }).fetch()
  },

  'participants.findOne': function (_id) {
    return Participants.findOne(_id)
  },

  // users
  'users.create': function (user, role, masterPassword) {
    if (_.isEqual(role, 'admin')) {
      let valid = checkMasterPassword(masterPassword);
      if (valid) {
        let _id = Accounts.createUser(user);
        Meteor.call('roles.add', _id, role, masterPassword, function () {
        });
      } else {
        throw new Meteor.Error('users.create', 'Invalid master password');
      }
    } else {
      let _id = Accounts.createUser(user);
      Meteor.call('roles.add', _id, role, function () {
      });
    }
  },
  'users.remove': function (_id) {
    let relatedParticipant = Participants.find({_id: _id});
    if (relatedParticipant) Participants.remove({_id: _id});

    let relatedSettings = Settings.findOne({_id: _id});
    if (relatedSettings) Settings.remove({_id: _id});
    return Meteor.users.remove(_id);
  },
  'users.update': function (user) {
    return Meteor.users.update(user._id || this.userId, {
      $set: user
    })
  },

  'admin.users.update': function (user) {
    // since Mongo throw errors for fucking every update
    // then retrieve previous state of deep object
    // and substitute new value
    let oldUser = Meteor.users.findOne({_id: user._id});
    // to avoid mongo error remove createdAt property
    if (oldUser && oldUser.createdAt) delete oldUser.createdAt;
    let newUser = _.merge(oldUser, unflatten(user));
    return Meteor.users.update(user._id || this.userId, {
      $set: newUser
    })
  },

  // roles
  'roles.add': function (_id, role, masterPassword) {
    if (_.isEqual(role, 'admin')) {
      // in order to avoid permission escalation
      // master password need to be checked before
      let valid = checkMasterPassword(masterPassword);
      if (valid) Roles.addUsersToRoles(_id, role);
      else throw new Meteor.Error('roles.add', 'Invalid master password');
    } else {
      Roles.addUsersToRoles(_id, role)
    }

  },

  'users.count': function (options) {
    return Meteor.users.find(options.query, {fields: options.fields, limit: options.limit, skip: options.skip}).count()
  },

  // handle tokens
  'token.check': function (token, hash) {
    let _id = '';

    check(token, String);
    check(hash, String);

    // decrypt token with hash as password
    let bytes = CryptoJS.AES.decrypt(token, hash);

    try {
      _id = bytes.toString(CryptoJS.enc.Base64);
    } catch (e) {
      throw new Meteor.Error('token.check', 'Invalid password');
    }

    // check if decrypted token (= _id) is in Participants
    let p = Participants.findOne({_id: _id});
    if (_.isUndefined(p)) throw new Meteor.Error('token.check', 'Invalid password');

    // return hash to be saved as session
    return _id
  },

  'settings.update': function (_id, field, rule, object) {
    switch (field) {
      case 'form':
        return Settings.upsert({_id: _id}, {$set: {'form.doNotAsk': object}});
        break;
      default:
        throw new Meteor.Error('settings.update', 'Wrong field');
        break;
    }
  },

  'settings.get': function (_id) {
    return Settings.findOne({_id: _id});
  },

  'conflicts.check': function () {

    // reset conflicts list
    let conflicts = [];

    // fetch available participants
    let participants = Participants.find().fetch();

    // iterate over each participant
    _.forEach(participants, function (p) {

      // set default values if fields do not exists
      // if (_.isUndefined(p.day1.bus1) || _.isEqual(p.day1.bus1, true)) Participants.update(p._id, {$set: {'day1.bus1': false}});
      // if (_.isUndefined(p.day1.bus2) || _.isEqual(p.day1.bus2, true)) Participants.update(p._id, {$set: {'day1.bus2': false}});
      // if (_.isUndefined(p.day1.meal1) || _.isEqual(p.day1.meal1, true)) Participants.update(p._id, {$set: {'day1.meal1': false}});
      // if (_.isUndefined(p.day2.bus1) || _.isEqual(p.day2.bus1, true)) Participants.update(p._id, {$set: {'day2.bus1': false}});
      // if (_.isUndefined(p.day2.bus2) || _.isEqual(p.day2.bus2, true)) Participants.update(p._id, {$set: {'day2.bus2': false}});
      // if (_.isUndefined(p.day2.meal1) || _.isEqual(p.day2.meal1, true)) Participants.update(p._id, {$set: {'day2.meal1': false}});
      // if (_.isUndefined(p.day2.meal2) || _.isEqual(p.day2.meal2, true)) Participants.update(p._id, {$set: {'day2.meal2': false}});
      // if (_.isUndefined(p.day2.drink1) || _.isEqual(p.day2.drink1, true)) Participants.update(p._id, {$set: {'day2.drink1': false}});
      // if (_.isUndefined(p.day3.bus1) || _.isEqual(p.day3.bus1, true)) Participants.update(p._id, {$set: {'day3.bus1': false}});
      // if (_.isUndefined(p.day3.meal1) || _.isEqual(p.day3.meal1, true)) Participants.update(p._id, {$set: {'day3.meal1': false}});
      // if (_.isUndefined(p.day3.meal2) || _.isEqual(p.day3.meal2, true)) Participants.update(p._id, {$set: {'day3.meal2': false}});
      // if (_.isUndefined(p.checkedIn) || _.isEqual(p.checkedIn, true)) Participants.update(p._id, {$set: {'checkedIn': false}});

      let isConflict = false;

      // set default info
      let newConflict = {
        _id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        university: p.university,
        email: p.email,
        hasPID: false,
        isPIDinCollection: false,
        PIDonServer: false,
        hasSID: false,
        isSIDinCollection: false,
        SIDonServer: false
      };

      // get info from IDs collection
      let PIDonServer, PIDfilename,
        PID = IDs.findOne({$and: [{$or: [{"meta.userId": p._id}, {"userId": p._id}]}, {'meta.type': 'personal'}]});
      let SIDonServer, SIDfilename,
        SID = IDs.findOne({$and: [{$or: [{"meta.userId": p._id}, {"userId": p._id}]}, {'meta.type': 'student'}]});

      // parse filename
      if (PID && PID.path) PIDfilename = _.last(PID.path.split('/'));
      if (SID && SID.path) SIDfilename = _.last(SID.path.split('/'));

      // check if files are on the server
      if (PID && PIDfilename) PIDonServer = existsSync(PIDfilename);
      if (SID && SIDfilename) SIDonServer = existsSync(SIDfilename);

      // avoid showing participants who haven't
      // tried to upload any ID
      if (p.hasPersonalID) {
        if (!(p.hasPersonalID && !!PID && PIDonServer)) {
          isConflict = true;
          newConflict['hasPID'] = p.hasPersonalID || false;
          newConflict['isPIDinCollection'] = !!PID;
          newConflict['PIDonServer'] = PIDonServer || false;
        }
      }

      if (p.hasStudentID) {
        if (!(p.hasStudentID && !!SID && SIDonServer)) {
          isConflict = true;
          newConflict['hasSID'] = p.hasStudentID || false;
          newConflict['isSIDinCollection'] = !!SID;
          newConflict['SIDonServer'] = SIDonServer || false;
        }
      }

      // push new conflict
      if (isConflict) conflicts.push(newConflict)
    });

    return conflicts
  },

  'server.ids.delete': function (filename) {
    let fullPath = path.join(process.cwd(), '../server/images/uploads/ids/', filename);
    return fs.unlinkSync(fullPath)
  },

  'events.schedule.strict': function () {
    return Events.find({showInSchedule: true}, {fields: {css: 0}, sort: {startDate: 1}}).fetch();
  },

  'events.one.css': function (_id) {
    return Events.findOne(_id).css
  },

  'events.one.description': function (_id) {
    return Events.findOne(_id).description
  },

  'events.one.description.exists': function (_id) {
    let description = Events.findOne(_id).description;
    return (!_.isUndefined(description) || !_.isEmpty(description))
  },

  'event.update': function (event) {
    return Events.update(event._id, {
      $set: event
    })
  },
  'event.insert': function (event) {
    return Events.insert(event)
  },
});

function existsSync(filename) {
  let fullPath = path.join(process.cwd(), '../server/images/uploads/ids/', filename);
  return fs.existsSync(fullPath)
}
