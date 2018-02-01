import "./admin.settings.html";
import Events from "/imports/collections/events";
import Participants from "/imports/collections/participants";
import Reports from "/imports/collections/reports";
import moment from "moment";

let eventSub;

Template.AdminSettingsSection.onCreated(function () {
  this.subscribe('events.all');
  this.subscribe('reports.all');
  this.subscribe('participants.all', {
    query: {checkedIn: true},
    fields: {
      firstName: 1,
      lastName: 1,
      statusComplete: 1,
      hasPersonalID: 1,
      hasStudentID: 1,
      updatedAt: 1,
      checkedIn: 1
    },
    limit: 10,
    sort: {updatedAt: -1},
    skip: 0
  })
});

Template.AdminSettingsSection.onRendered(function () {
  let eventDescEditor = $('div#event-description-editor');
  // init description editor
  eventDescEditor.froalaEditor({
    pluginsEnabled: ['image', 'link', 'align', 'colors', 'url', 'lists', 'fontSize', 'inlineStyle'],
    height: 300,
    heightMax: 500
  });

  // event fired whenever the modal has finished being hidden
  $('#admin-event-modal').on('hidden.bs.modal', function (e) {
    // reset text editor
    eventDescEditor.froalaEditor('html.set', '');

    // stop event subscription
    eventSub.stop();

    // reset session variable
    Session.set('eventId', '');
  })
});

Template.AdminSettingsSection.onDestroyed(function () {

});

Template.AdminSettingsSection.helpers({
  // todo: this should be handled in the settings as well by defining which are the days
  day: function (day) {
    let startDate;
    switch (day) {
      case 1:
        startDate = moment('2018-03-08');
        break;
      case 2:
        startDate = moment('2018-03-09');
        break;
      case 3:
        startDate = moment('2018-03-10');
        break;
      default:
        throw new Meteor.Error('AdminSettingsSection helpers', 'wrong day')
    }

    let query = {
      $gte: startDate.toDate(),
      $lt: moment(startDate).add(1, 'days').toDate()
    };

    return Events.find({
      startDate: query
    }, {sort: {startDate: 1}}).fetch()
  },
  mobileEvents: function () {
    return Events.find({checkRequired: true}, {sort: {startDate: 1}}).fetch()
  },
  lastUpdates: function () {
    return Participants.find({}, {sort: {updatedAt: -1}, limit: 10}).fetch()
  },
  reports: function () {
    return Reports.find({}, {sort: {createdAt: 1}}).fetch()
  }
});

Template.AdminSettingsSection.events({
  'click .sn-open-modal': function (event, template) {
    // get eventId
    let eventId = $(event.target).attr('data-event-id');

    // set session variable needed by helpers
    Session.set('eventId', eventId);

    // show modal
    $('#admin-event-modal').modal('show');
  },

  'submit #event-form': function (event, template) {
    event.preventDefault();

    // eventId
    let eventId = Session.get('eventId');

    // values from form elements
    const target = event.target;

    // saving spinner
    $(target.save).text('Loading...');

    // retrieve date and time
    let startDate = target.startDate.value;
    let startTime = target.startTime.value;
    let endDate = target.endDate.value;
    let endTime = target.endTime.value;
    let description = $('div#event-description-editor').froalaEditor('html.get', true);
    let checkRequired = target.check_required.checked;
    let showInSchedule = target.show_in_schedule.checked;

    // date and time regex
    let dateRegex = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}');
    let timeRegex = new RegExp('([01][0-9]|2[0-3]):[0-5][0-9]');

    // check if date and time match regex
    let startDateMatch = dateRegex.test(startDate);
    let startTimeMatch = timeRegex.test(startTime);
    let endDateMatch = dateRegex.test(endDate);
    let endTimeMatch = timeRegex.test(endTime);

    // throw errors if not matching
    if (!startDateMatch || !endDateMatch)
      return swal('Error', 'Wrong date format', 'error');

    if (!startTimeMatch || !endTimeMatch)
      return swal('Error', 'Wrong time format', 'error');


    // split dates
    let sds = startDate.split('-'); // startDateSplit
    let eds = endDate.split('-'); // endDateSplit

    // split times
    let sts = startTime.split(':'); // startTimeSplit
    let ets = endTime.split(':'); // endTimeSplit

    // create date object
    let startDateObj = new Date(sds[0], sds[1] - 1, sds[2], sts[0], sts[1]);
    let endDateObj = new Date(eds[0], eds[1] - 1, eds[2], ets[0], ets[1]);

    let eventObj = {
      _id: eventId,
      name: target.name.value,
      subtitle: target.subtitle.value,
      type: target.type.value,
      startDate: startDateObj,
      endDate: endDateObj,
      description: description,
      checkRequired: checkRequired,
      showInSchedule: showInSchedule,
      css: {
        height: target.height.value,
        width: target.width.value,
        top: target.top.value,
        left: target.left.value
      }
    };

    // if NFC check is required then save check action as well
    if (checkRequired) {
      let checkAction = target.check_action.value;

      // check action cannot be empty
      if (_.isEmpty(checkAction)) {
        // reset save button
        $(target.save).text('Save');
        return swal('Error', 'Check action cannot be empty if a check is required', 'error');
      } else eventObj['checkAction'] = checkAction
    }

    // if eventId is undefined then insert, otherwise update
    let action = _.isUndefined(eventId) ? 'insert' : 'update';

    // update event
    Meteor.call('event.' + action, eventObj, function (error) {
      if (error) {
        swal('Error', error, 'error');
      } else {
        // clear form
        template.find("#event-form").reset();
        // hide modal
        $('#admin-event-modal').modal('hide');
      }
      // reset save button
      $(target.save).text('Save');
    });

  }
});

Template.AdminSettingsConflicts.onCreated(function () {
  let template = Template.instance();
  template.conflicts = new ReactiveVar();
  template.loading = new ReactiveVar(true);

  Meteor.call('conflicts.check', function (error, conflicts) {
    if (error) swal('Error', error, 'error');
    else {
      template.conflicts.set(conflicts);
      template.loading.set(false)
    }
  });

  // duplicated here because otherwise this template
  // wouldn't be accessible from others
  // event fired whenever the modal has finished being hidden
  $('#admin-event-modal').on('hidden.bs.modal', function (e) {
    // clear form
    template.find("#event-form").reset();
  });
});

Template.AdminSettingsConflicts.onDestroyed(function () {
  Template.instance().conflicts.set();
});

Template.AdminSettingsConflicts.helpers({
  loading: function () {
    return Template.instance().loading.get()
  },
  conflicts: function () {
    return Template.instance().conflicts.get() || []
  }
});

Template.AdminSettingsScheduleModal.onCreated(function () {
  Template.instance().checkRequired = new ReactiveVar(false);

  this.autorun(() => {
    let eventId = Session.get('eventId');
    eventSub = Meteor.subscribe("events.one", eventId, function onStop(error) {
      if (error) swal('Error', error, 'error');
      console.log("events.one [EventModal] STOP: " + eventId)
    }, function onReady() {
      console.log("events.one [EventModal] START: " + eventId)
    });
  });
});

Template.AdminSettingsScheduleModal.helpers({
  event: function () {
    let eventId = Session.get('eventId');
    let event = Events.findOne(eventId);

    if (event) {
      // also set dates and times
      let sd = event.startDate;
      let st = event.startDate;
      let ed = event.endDate;
      let et = event.endDate;

      $('#startDate').val(moment(sd).format('YYYY-MM-DD'));
      $('#startTime').val(moment(st).format('HH:mm'));
      $('#endDate').val(moment(ed).format('YYYY-MM-DD'));
      $('#endTime').val(moment(et).format('HH:mm'));

      // set description in editor
      $('div#event-description-editor').froalaEditor('html.set', event.description);

      //
      Template.instance().checkRequired.set(event.checkRequired)
    }

    return event; // undefined if adding new event
  },
  checkRequired: function () {
    return Template.instance().checkRequired.get()
  }
});

Template.AdminSettingsScheduleModal.events({
  'change #check_required': function (event, template) {
    template.checkRequired.set(event.target.checked)
  }
});