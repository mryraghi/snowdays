let CryptoJS = require("crypto-js");
import _ from 'lodash'
import base64url from 'base64url'

import {checkMasterPassword} from './utilities'
import Participants from '/imports/collections/participants'

Meteor.methods({

  // participants
  'participants.insert': function (participant) {
    let user = Meteor.user();
    let allowed = Roles.userIsInRole(user._id, 'external');

    if (allowed) {
      if (!_.isUndefined(user.profile.token))
        throw new Meteor.Error('participants.insert', 'Undefined token');

      // double check that limit has not been reached
      let count = Participants.find({_id: {$ne: Meteor.userId()}}).count();

      // could be moved elsewhere
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
      participant.token = base64url.encode(encrypted.toString());
    }

    // insert participant
    return Participants.insert(participant);
  },
  'participants.update': function (participant) {
    return Participants.update(participant._id, {
      $set: participant
    });
  },
  'participants.remove': function (_id) {
    return Participants.remove(_id);
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
    return Meteor.users.remove(_id);
  },
  'users.update': function (user) {
    return Meteor.users.update(this.userId, {
      $set: user
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
  }
});

