import './api'
import './publish'
import './methods'
import './permissions'

/**
 * Customize new user creation.
 * @constructor
 * @param {Object} options - comes from Accounts.createUser for password-based users
 * @param {Object} user - created on the server and contains a proposed user object with all the automatically generated fields required for the user to log in, including the _id
 * @returns {Object} user
 */
Accounts.onCreateUser(function (options, user) {
  Roles.addUsersToRoles(user._id, ['contact-person']);

  Participants.insert({
    _id: user._id,
    email: options.email,
    first_name: options.profile.first_name,
    last_name: options.profile.last_name
  }, (error) => {
    if (error) throw new Error(error);
  });

  // adds profile
  if (options.profile) user.profile = options.profile;

  return user;
});