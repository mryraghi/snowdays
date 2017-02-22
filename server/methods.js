let CryptoJS = require("crypto-js");
let fs = require('fs');

import _ from "lodash";
import base64url from "base64url";
import {checkMasterPassword, unflatten} from "./utilities";
import Participants from "/imports/collections/participants";
import Settings from "/imports/collections/settings";

Meteor.methods({

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
    if (_.isUndefined(p)) throw new Meteor.Error('participants.update', 'No related participant exists');

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
    console.log(_id, Participants.find({
      "owner": {$exists: true},
      $and: [{"owner": owner}, {$and: [{"_id": {$ne: _id}}]}]
    }).count());
    return Participants.find({
      "owner": {$exists: true},
      $and: [{"owner": owner}, {$and: [{"_id": {$ne: _id}}]}]
    }).fetch()
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

  'id.exists': function (filename) {
    return fs.existsSync('/bundle/bundle/programs/server/images/uploads/ids/' + filename)
  }
});

