import "./logs";
import "./api";
import "./publish";
import "./methods";
import "./permissions";
import Participants from "/imports/collections/participants";

Meteor.startup(function () {
  // let events = Events.find().fetch();
  // _.forEach(events, function (e) {
  //   Events.update(e._id, {$set: {showInSchedule: true}})
  // });

  // let participants = Participants.find().fetch();
  // _.forEach(participants, function (p) {
  //   if (_.isUndefined(p.day1.bus1)) Participants.update(p._id, {$set: {'day1.bus1': false}});
  //   if (_.isUndefined(p.day1.bus2)) Participants.update(p._id, {$set: {'day1.bus2': false}});
  //   // if (_.isUndefined(p.day1.meal1)) Participants.update(p._id, {$set: {'day1.meal1': false}});
  //   if (_.isUndefined(p.day1.meal2)) Participants.update(p._id, {$set: {'day1.meal2': false}});
  //
  //   if (_.isUndefined(p.day2.bus1)) Participants.update(p._id, {$set: {'day2.bus1': false}});
  //   if (_.isUndefined(p.day2.bus2)) Participants.update(p._id, {$set: {'day2.bus2': false}});
  //   if (_.isUndefined(p.day2.meal1)) Participants.update(p._id, {$set: {'day2.meal1': false}});
  //   if (_.isUndefined(p.day2.meal2)) Participants.update(p._id, {$set: {'day2.meal2': false}});
  //   if (_.isUndefined(p.day2.drink1)) Participants.update(p._id, {$set: {'day2.drink1': false}});
  //   if (_.isUndefined(p.day2.hasSkipass)) Participants.update(p._id, {$set: {'day2.hasSkipass': false}});
  //
  //   if (_.isUndefined(p.day3.bus1)) Participants.update(p._id, {$set: {'day3.bus1': false}});
  //   if (_.isUndefined(p.day3.meal1)) Participants.update(p._id, {$set: {'day3.meal1': false}});
  //   if (_.isUndefined(p.day3.meal2)) Participants.update(p._id, {$set: {'day3.meal2': false}});
  // });
});

/**
 * Customize new user creation.
 * @constructor
 * @param {Object} options - comes from Accounts.createUser for password-based users
 * @param {Object} user - created on the 404 and contains a proposed user object with all the automatically generated fields required for the user to log in, including the _id
 * @returns {Object} user
 */
Accounts.onCreateUser(function (options, user) {
  let createParticipant = options.createParticipant;

  // if flag in login page is checked
  if (createParticipant) {
    if (user) {
      const participant = {
        _id: user._id,
        firstName: options.profile.firstName,
        lastName: options.profile.lastName,
        university: options.profile.university,
        gender: options.profile.gender
      };

      Meteor.call('participants.insert', participant, function (error, result) {
        console.log('createParticipant');
        if (error) {
          console.log(error, participant);
          throw new Meteor.Error('participants.insert', error.message);
        }
      })
    }
  }

  // adds externals
  if (options.profile) user.profile = options.profile;

  return user;
});