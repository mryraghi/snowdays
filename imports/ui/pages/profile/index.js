import './profile.html'
import './profile-form.html'
import './profile-form'
import moment from 'moment'
import Survey from 'survey-knockout'

Template.ProfilePage.onCreated(function () {
  // subscribe as soon the template is created
  this.subscribe("currentUserData");
  this.subscribe("allowedParticipantsData");

  // set default tab to 'login'
  this.currentTab = new ReactiveVar("AddNewSection");

  var user = Meteor.user();

  // if (user) {
  //   // Drift Chat
  //   !function () {
  //     var t;
  //     if (t = window.driftt = window.drift = window.driftt || [], !t.init) return t.invoked ? void (window.console && console.error && console.error("Drift snippet included twice.")) : (t.invoked = !0,
  //       t.methods = ["identify", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on"],
  //       t.factory = function (e) {
  //         return function () {
  //           var n;
  //           return n = Array.prototype.slice.call(arguments), n.unshift(e), t.push(n), t;
  //         };
  //       }, t.methods.forEach(function (e) {
  //       t[e] = t.factory(e);
  //     }), t.load = function (t) {
  //       var e, n, o, r;
  //       e = 3e5, r = Math.ceil(new Date() / e) * e, o = document.createElement("script"),
  //         o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + r + "/" + t + ".js",
  //         n = document.getElementsByTagName("script")[0], n.parentNode.insertBefore(o, n);
  //     });
  //   }();
  //   drift.SNIPPET_VERSION = '0.2.0';
  //   drift.load('u9x8a6i34wih');
  //
  //   drift.identify(this.userID, {
  //     name: user.profile.first_name + ' ' + user.profile.last_name,
  //     email: user.emails[0].address
  //   });
  // }

});


Template.ProfilePage.events({

  'click #logout': (event, template) => {
    Meteor.logout((error) => {
      // window.drift.reset();
      if (error) console.log(error)
    })
  },

  'click .go-to-section': (event, template) => {
    switch (event.currentTarget.id) {
      case 'home':
        template.currentTab.set('HomeSection');
        break;
      case 'profile':
        template.currentTab.set('ProfileSection');
        break;
      case 'participants':
        template.currentTab.set('ParticipantsSection');
        break;
      case 'faq':
        template.currentTab.set('FaqSection');
        break;
      case 'add':
        template.currentTab.set('AddNewSection');
        break;
      case 'survey':
        template.currentTab.set('SurveySection');
        break;
    }
  }

});

Template.ProfilePage.helpers({
  tab: function () {
    return Template.instance().currentTab.get();
  },
  survey: function () {
    var user = Meteor.user();
    if (user) return !user.survey
  }
});

Template.HomeSection.helpers({


  // allowed number of participants
  a_participants: () => {
    var user = Meteor.user();
    // TODO: allowed_participants of undefined
    if (user) return user.profile.allowed_participants
  },
  moment: (date, format) => {
    return moment(date).format(format)
  },
  progress: (n, m) => {
    var p = (n * 100) / m;

    if (0 < p && p < 80) return 'progress-danger';
    if (80 <= p && p < 100) return 'progress-warning';
    return 'progress-success'
  }
});

Template.registerHelper('n_participants', () => {
  var user = Meteor.user();

  // owner field must exists and be equal to its owner's _id
  if (user) return Participants.find({owner: {$exists: true, $eq: this.userId}}).count()
});


Template.SurveySection.onRendered(function () {
  // Survey.Survey.cssType = "bootstrap";
  var survey = new Survey.Survey(
    {
      completedHtml: "<p class=\"text-success m-t-1 text-xs-center\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i> Thank you, your efforts are greatly appreciated.</p>",
      pages: [
        {
          name: "page1",
          questions: [
            {
              type: "rating",
              isRequired: true,
              name: "experience",
              title: "How would you rate your experience with SnowDays' website?"
            }
          ]
        },
        {
          name: "page2",
          questions: [
            {
              type: "comment",
              name: "problems",
              title: "Have you encountered any problems?"
            }
          ]
        },
        {
          name: "page3",
          questions: [
            {
              type: "comment",
              name: "suggestions",
              title: "Do you have any other suggestion, comments, or requests for SnowDays?"
            }
          ]
        }
      ],
      showPageNumbers: true
    });

  survey.css = {
    root: "card card-block",
    rating: {root: "btn-group btn-group-sm"},
    error: {
      root: "text-danger",
      icon: "fa fa-times"
    },
    comment: "form-control",
    navigationButton: "btn btn-sm btn-secondary m-t-1",
    navigation: {complete: "btn btn-success"},
    text: "form-control"
  };

  survey.onComplete.add(function (s) {
    Surveys.insert(s.data, function (error) {
      if (error) {
        swal('Error', 'There was an error sending your feedback.', 'error')
      } else {
        Meteor.users.update({_id: Meteor.userId()}, {$set: {survey: true}}, function (error) {
          if (error) swal('Error', error, 'error')
        })
      }
    })
  });
  survey.render("website-survey");
});