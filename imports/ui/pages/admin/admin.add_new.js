import "./admin.add_new.html";
import _ from "lodash";

Template.AdminAddNewSection.events({
  'submit #admin_add_new_unibz_form': function (event, template) {
    event.preventDefault();

    // get form values
    let target = event.target;
    let firstName = target.first_name.value;
    let lastName = target.last_name.value;
    let studentID = target.student_id.value;
    let gender = target.gender.value;
    let password = target.password.value || Math.random().toString(36).slice(-8);


    let user = {
      username: studentID,
      password: password,
      profile: {
        firstName: firstName,
        lastName: lastName,
        university: 'UniBz',
        gender: gender
      },
      createParticipant: true
    };

    // create user
    Meteor.call('users.create', user, 'unibz', function (error) {
      if (error) swal('Error', error.message, 'error');
      else {
        swal({
          title: 'User created',
          type: 'success',
          html: '<strong>Password:</strong> <code>' + password + '</code>',
          confirmButtonText: 'OK',
          confirmButtonColor: '#008eff'
        });

        // Clear form
        template.find("#admin_add_new_unibz_form").reset();
      }
    });
  },
  'submit #admin_add_new_cp_form': function (event, template) {
    event.preventDefault();

    // get form values
    let target = event.target;
    let firstName = target.first_name.value;
    let lastName = target.last_name.value;
    let university = target.university.value;
    let gender = target.gender.value;
    let n_participants = target.n_participants.value;
    let password = target.password.value || Math.random().toString(36).slice(-8);

    // generate username
    let username = _.toLower(firstName.split(' ')[0] + '.' + lastName.split(' ')[0]);

    let user = {
      username: username,
      password: password,
      profile: {
        firstName: firstName,
        lastName: lastName,
        university: university,
        gender: gender,
        allowedParticipants: n_participants - 1,
        survey: false
      },
      createParticipant: true
    };

    // create user
    Meteor.call('users.create', user, 'external', function (error) {
      if (error) swal('Error', error.message, 'error');
      else {
        swal({
          title: 'User created',
          type: 'success',
          html: '<strong>Username:</strong> <code>' + username + '</code><br>' +
          '<strong>Password:</strong> <code>' + password + '</code>',
          confirmButtonText: 'OK',
          confirmButtonColor: '#008eff'
        });

        // Clear form
        template.find("#admin_add_new_cp_form").reset();
      }
    });
  }
});