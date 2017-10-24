if (Meteor.isDevelopment && Meteor.users.find().count() == 0) {

    console.log("seeding the database");
    let user = {
        username: 'unibz_user',
        email: 'unibz@me.com',
        password: 'password',
        profile: {
            first_name: 'unibz',
            last_name: 'ubibz',
            allowed_participants: 20
        }
    };
    Accounts.createUser(user);
    let test = Meteor.users.findOne({username: user.username});
    Roles.addUsersToRoles(test._id, 'unibz');

    let admin = {
        username: 'admin',
        email: 'admin@me.com',
        password: 'password',
        profile: {
            first_name: 'admin',
            last_name: 'admin',
            allowed_participants: 20
        }
    };
    Accounts.createUser(admin);
    let test_admin = Meteor.users.findOne({username: admin.username});
    Roles.addUsersToRoles(test_admin._id, 'admin');

    let external = {
        username: 'external',
        email: 'external@me.com',
        password: 'password',
        profile: {
            first_name: 'external',
            last_name: 'external',
            allowed_participants: 20
        }
    };
    Accounts.createUser(external);
    let test_external = Meteor.users.findOne({username: external.username});
    Roles.addUsersToRoles(test_external._id, 'external');

};