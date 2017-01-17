import './participant.html'
import {checkToken} from '/lib/js/utilities'
import _ from 'lodash'
import Participants from '/imports/collections/participants'
import '/imports/ui/components/forms/participant.form'
import '/imports/ui/components/loader/loader'

let CryptoJS = require("crypto-js");

Template.ParticipantPage.onCreated(function () {
  this.hash = new ReactiveVar();
  this.token = new ReactiveVar((this.data && this.data.token ? this.data.token : ''));

  Tracker.autorun(function () {
    let first = Meteor.subscribe("participants.current", Session.get('_id'));
    if (first.ready()) {
      let p = Participants.findOne({_id: Session.get('_id')});
      if (p && p.owner) Meteor.subscribe("users.one.strict", p.owner)
    }
  })
});

Template.ParticipantPage.onRendered(function () {
  renderDrift()
});

Template.ParticipantPage.helpers({
  complete: function () {
    let p = Participants.findOne();
    return (p ? p.statusComplete : false);
  },
  loggedIn: function () {
    let user = Meteor.user();
    if (user) Session.set('_id', user._id);
    return !!user;
  },
  validToken: function () {
    let hash = Template.instance().hash.get();
    let token = Template.instance().token.get();

    let _id = checkToken(token, hash);

    if (!_.isUndefined(_id)) Session.set('_id', _id);

    return (!_.isUndefined(_id))
  },
  owner: function () {
    return Meteor.users.findOne()
  }
});

Template.ParticipantPage.events({
  'submit #password_verification_form': function (event, template) {
    event.preventDefault();

    // get password from form
    const password = event.target.password.value;

    // hash password
    let hash = CryptoJS.SHA3(password);

    template.hash.set(hash.toString());
  },

  'click #sn-logout': (event, template) => {
    Meteor.logout((error) => {
      // window.drift.reset();
      if (error) console.log(error)
    })
  }
});

function renderDrift() {
  // !function () {
  //   var t;
  //   if (t = window.driftt = window.drift = window.driftt || [], !t.init) return t.invoked ? void (window.console && console.error && console.error("Drift snippet included twice.")) : (t.invoked = !0,
  //       t.methods = ["identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on"],
  //       t.factory = function (e) {
  //         return function () {
  //           var n;
  //           return n = Array.prototype.slice.call(arguments), n.unshift(e), t.push(n), t;
  //         };
  //       }, t.methods.forEach(function (e) {
  //       t[e] = t.factory(e);
  //     }), t.load = function (t) {
  //       var e, n, o, i;
  //       e = 3e5, i = Math.ceil(new Date() / e) * e, o = document.createElement("script"),
  //         o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + i + "/" + t + ".js",
  //         n = document.getElementsByTagName("script")[0], n.parentNode.insertBefore(o, n);
  //     });
  // }();
  // drift.SNIPPET_VERSION = '0.3.1';
  // drift.load('u9x8a6i34wih');
  // drift.debug();
}