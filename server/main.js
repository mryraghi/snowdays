import './logs'
import './api'
import './publish'
import './methods'
import './permissions'

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