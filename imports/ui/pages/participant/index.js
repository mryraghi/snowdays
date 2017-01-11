import './participant.html'
import _ from 'lodash'
import Participants from '/imports/collections/participants'
import '../profile/user-form'
import '/imports/ui/components/loader/loader'
import base64url from 'base64url'

let CryptoJS = require("crypto-js");
let cookies = new Cookies();
import SimpleSchema from 'simpl-schema';

Template.ParticipantPage.onCreated(function () {
  let decodedToken = base64url.decode(this.data.token);

  // set session variable if cookie is available
  if (!_.isUndefined(cookies.get('hash'))) Session.set('hash', cookies.get('hash'));

  // set token as session variable
  Session.set('token', decodedToken);

  checkToken(decodedToken, cookies.get('hash'));

  // log out if user is logged in
  Meteor.defer(function () {
    const user = Meteor.user();
    if (user) {
      Meteor.logout((error) => {
        if (error) console.log(error)
      })
    }
  });
});

Template.ParticipantPage.helpers({
  validCookie: function () {
    let p = Participants.findOne({_id: Session.get('_id')});
    return (!_.isUndefined(p));
  }
});

Template.ParticipantPage.events({
  'submit #password_verification_form': function (event) {
    event.preventDefault();

    // get password from form
    const password = event.target.password.value;

    // hash password
    let hash = CryptoJS.SHA3(password);

    // check token validity
    checkToken(Session.get('token'), hash.toString())
  }
});

function checkToken(token, hash) {
  let _idRegex = SimpleSchema.RegEx.Id;

  let _id = '';

  // if one is null do nothing
  if (!_.isNull(token) && !_.isNull(hash)) {

    // decrypt token with hash as password
    let bytes = CryptoJS.AES.decrypt(token, hash);

    try {
      _id = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      // do nothing
    }

    // subscribe only if _id matches regex
    if (_idRegex.test(_id)) {
      Meteor.subscribe("participants.current", _id, {
        onReady: function () {
          // check if decrypted token (= _id) is in Participants
          let p = Participants.findOne({_id: _id});

          if (!_.isUndefined(p)) {
            Session.set('_id', _id);
            cookies.set('hash', hash.toString());
          }
        }
      });
    } else {
      swal('Error', 'Invalid password or token', 'error')
    }
  }
}

