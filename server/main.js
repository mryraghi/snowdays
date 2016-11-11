import './api'
import './publish'
import './methods'
import './permissions'


Accounts.onCreateUser(function (options, user) {
  Roles.addUsersToRoles(user._id, ['contact-person']);

  Participants.insert({
    _id: user._id,
    email: options.email,
    first_name: options.profile.first_name,
    last_name: options.profile.last_name
  }, (error) => {
    if (error) console.log('error:', error);
  });

  return user;
});