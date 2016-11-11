import {resetDatabase} from 'meteor/xolvio:cleaner';

Participants = new Mongo.Collection("participants");

Meteor.methods({
  'test.resetDatabase': () => resetDatabase(),
});

describe('user', function () {
  var user = {
    username: 'rbellon',
    email: 'romeo.bellon@me.com',
    password: 'password',
    profile: {
      first_name: 'Romeo',
      last_name: 'Bellon',
      allowed_participants: 20
    }
  };

  before(function (done) {
    Meteor.call('test.resetDatabase', done);
  });

  it('should be created', function () {
    assert.isDefined(Accounts.createUser(user));
  });

  it('should be in user collection', function () {
    assert.isDefined(Meteor.users.findOne({username: user.username}));
  });

  it('should have a role', function () {
    var test = Meteor.users.findOne({username: user.username});
    Roles.addUsersToRoles(test._id, 'contact-person');
    assert.isTrue(Roles.userIsInRole(test._id, ['contact-person']));
  });

  it('should add it to participants collection', function (done) {
    var test = Meteor.users.findOne({username: user.username});
    if (test) {
      Participants.insert({
        _id: test._id,
        email: test.emails[0].address,
        first_name: test.profile.first_name,
        last_name: test.profile.last_name
      }, done);
    }
  });
});