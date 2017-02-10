import "./admin.list.html";
import Participants from "/imports/collections/participants";
import jwt from "jsonwebtoken";
import _ from "lodash";
import {deepFind} from "/lib/js/utilities";
import "/node_modules/bootstrap/dist/js/bootstrap.min";

let fields = require('/imports/collections/db_allowed_values.json');

const participantsIndices = {'statusComplete': 1, 'firstName': 1, 'lastName': 1};

const usersIndices = {'username': 1, 'profile.firstName': 1, 'profile.lastName': 1, 'roles': 1};

// Modal
let modalSub, modalSubOwner, modalSubUser, modalSubParticipant;

let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  server_name: 'snowdays',
  tags: {section: 'API'},
  autoBreadcrumbs: true
});

// catches all exceptions on the server
// raven.patchGlobal(client);

client.on('logged', function () {
  console.log('Exception handled and sent to Sentry.io');
});

client.on('error', function (e) {
  // The event contains information about the failure:
  //   e.reason -- raw response body
  //   e.statusCode -- response status code
  //   e.response -- raw http response object

  console.log('Couldn\'t connect to Sentry.io');
});


Template.AdminListSection.onCreated(function () {

  // template instance
  let template = Template.instance();

  template.flattenedFields = new ReactiveVar(participantsIndices);
  template.limit = new ReactiveVar(5);
  template.skip = new ReactiveVar(0);
  template.count = new ReactiveVar(0);

  template.collection = new ReactiveVar({
    name: 'participants',
    instance: Participants,
    flattened: template.flattenedFields.get(),
    searchQuery: '',
    filters: []
  });

  // subscribe as soon the template is created
  // this.subscribe("users.current");
  this.autorun(() => {
    let collection = template.collection.get();
    let limit = template.limit.get();
    let skip = template.skip.get();

    $.when(setSubscription(collection.name, collection.filters, collection.searchQuery, collection.flattened, limit, skip)).done(function (options) {
      Meteor.subscribe(collection.name + ".all", options, () => {
        Meteor.call(collection.name + '.count', options, function (error, count) {
          template.count.set(count);
          setTimeout(() => {
            generateTable(template, options);
          }, 300);
        });
      });
    })
  });
});

Template.AdminListSection.onRendered(function () {

});

Template.AdminListSection.events({

  'click .sn-open-modal': function (event, template) {
    let modalId = $(event.target).attr('data-modal-id');
    let userId = $(event.target).attr('data-user-id');
    Session.set('_id', userId);
    Session.set('userModalTab', 'UserModalParticipant');
    $('#' + modalId).modal('show')
  },

  'click .sn-close-modal': function (event, template) {
    let modalId = $(event.target).attr('data-modal-id');
    modalSub.stop();
    Session.set('_id', '');
    $('#' + modalId).modal('hide')
  },

  /**
   * Switches between collections
   */
  'change #collection_select': function (event, template) {
    let collectionName = event.target.value;

    if (_.isEqual(collectionName, 'users')) {
      template.collection.set({
        name: collectionName,
        instance: Meteor.users,
        flattened: usersIndices,
        searchQuery: '',
        filters: []
      });
    } else {
      template.collection.set({
        name: collectionName,
        instance: Participants,
        flattened: participantsIndices,
        searchQuery: '',
        filters: []
      })
    }

    // reset skip and limit
    template.skip.set(0);
    template.limit.set(5);

    // reset search input
    $('#search').val('')
  },

  /**
   * When selecting filters for filtering, it regenerates
   * related allowed values' select options
   */
  'change #select_field': function (event, template) {
    let field = event.target.value;
    let collection = template.collection.get();
    let instance = collection.instance;

    // TODO: everything should be set and retrieve from the website/db like this
    // if (_.isEqual(field, 'university')) {
    // retrieve all values from server
    // console.log(Meteor.call('collection.raw', instance));
    // }

    // deep find in object, returns values allowed
    let allowed = deepFind(fields[collection.name], field) || deepFind(fields['common'], field) || deepFind(fields['common'], 'boolean');

    createOptionChildren(allowed, 'select_value');
  },

  /**
   * Adds filters
   */
  'submit #add_filter_form': function (event, template) {
    event.preventDefault();

    let newFilter;
    let collection = template.collection.get();
    let field = event.target.select_field.value;
    let operation = event.target.operation.value;
    let value = event.target.select_value.value;
    let currentFilters = collection.filters;
    let flattened = collection.flattened;

    if (!_.isEqual(field, 'Field') && !_.isEqual(value, 'Value')) {

      // _.zipObject returns an object composed from key-value pairs
      if (_.isEqual(operation, 'e')) {
        if (_.isEqual(value, 'true')) value = true;
        if (_.isEqual(value, 'false')) value = false;

        console.log(value);
        newFilter = _.zipObject([field], [{$eq: value}]);
      } else if (_.isEqual(operation, 'ne')) {
        newFilter = _.zipObject([field], [{$ne: value}]);
      }

      currentFilters.push(newFilter);
      flattened[field] = 1;

      // reset skip
      template.skip.set(0);

      template.collection.set({
        name: collection.name,
        instance: collection.instance,
        flattened: flattened,
        searchQuery: collection.searchQuery,
        filters: currentFilters
      });

      // Clear form
      document.getElementById('add_filter_form').reset();
    }
  },

  /**
   * Deletes filters
   */
  'click #sn-delete-filter': (event, template) => {
    // get filter index
    let index = $(event.target).attr("name");
    let collection = template.collection.get();
    let currentFilters = collection.filters;

    // remove from array at index
    _.pullAt(currentFilters, [index]);

    // reset skip
    template.skip.set(0);

    // update reactive variable
    template.collection.set({
      name: collection.name,
      instance: collection.instance,
      flattened: collection.flattened,
      searchQuery: collection.searchQuery,
      filters: currentFilters
    });

  },

  /**
   * Handles search
   */
  'keyup [name="search"]': (event, template) => {
    let value = event.target.value.trim();
    let collection = template.collection.get();

    // keyCode 13 = 'enter'
    if (event.keyCode === 13) {
      template.collection.set({
        name: collection.name,
        instance: collection.instance,
        flattened: collection.flattened,
        searchQuery: value,
        filters: collection.filters
      });
    }
  },

  /**
   * Updates fields in table
   */
  'submit #fields_form': function (event, template) {
    event.preventDefault();
    let collection = template.collection.get();

    let currentFlattenedFields = collection.flattened;

    // replace each _ in children inputs with .
    $(event.target).find('input').each(function () {
      let replaced = this.id.replace(/_/g, '.');

      // set value = 1
      if (this.checked) currentFlattenedFields[replaced] = 1;

      // or delete property
      else delete currentFlattenedFields[replaced];
    });

    // update reactive variable
    template.collection.set({
      name: collection.name,
      instance: collection.instance,
      flattened: currentFlattenedFields,
      searchQuery: collection.searchQuery,
      filters: collection.filters
    });
  },

  'click #download_csv': function (event, template) {
    let collection = template.collection.get();
    let filename = '';
    let download = '';


    swal.setDefaults({
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      allowOutsideClick: false,
      progressSteps: ['1', '2']
    });

    let steps = [
      {
        title: 'Download ...',
        input: 'radio',
        inputOptions: {
          'all': ' All current collection',
          'results': ' Results shown only'
        },
        confirmButtonColor: '#008eff',
        inputValidator: function (result) {
          return new Promise(function (resolve, reject) {
            if (result) {
              download = result;
              resolve()
            } else {
              reject('You need to select something!')
            }
          })
        }
      },
      {
        title: 'Please give the file a name',
        input: 'text',
        showCancelButton: true,
        confirmButtonColor: '#008eff',
        confirmButtonText: 'Download',
        inputValidator: function (result) {
          return new Promise(function (resolve, reject) {
            if (result) {
              filename = result;
              resolve()
            } else {
              reject('You need to write something!')
            }
          })
        },
        preConfirm: function () {
          return new Promise(function (resolve) {
            swal.resetDefaults();
            // limit, skip = whatever since is not considered in the server route
            $.when(setSubscription(collection.name, collection.filters, collection.searchQuery, collection.flattened, 0, 0)).done(function (options) {
              options['collection'] = collection.name;
              options['filename'] = filename;
              options['download'] = download;
              let encoded = jwt.sign(options, 'secret', {expiresIn: 60});
              Router.go('/csv/' + encoded);
            })
          })
        }
      }
    ];

    swal.queue(steps).then(function () {
      console.log('steps');
      // TODO: exit dialog before downloading
    })
  },

  'click #sn-delete-entry': function (event, template) {
    let _id = $(event.target).attr("name");
    let collection = template.collection.get();
    let limit = template.limit.get();
    let skip = template.skip.get();

    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008eff',
      cancelButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, delete it!'
    }).then(function () {
      Meteor.call(collection.name + '.remove', _id, function (error, result) {
        if (error) swal('Error', error.message, 'error');
        else if (_.isEqual(0, result)) swal('Warning', 'Object in ' + collection.name + ' not removed!', 'warning');
        else {
          $.when(setSubscription(collection.name, collection.filters, collection.searchQuery, collection.flattened, limit, skip)).done(function (options) {
            generateTable(template, options);
          })
        }
      })
    });
  },

  'change #limit_field': function (event, template) {
    let value = event.target.value;

    // update reactive variable
    template.limit.set(value);

    // reset skip
    template.skip.set(0)
  },

  'click .pagination_item': function (event, template) {
    let value = event.target.name;
    let limit = template.limit.get();

    template.skip.set((value - 1) * limit)
  },

});

Template.AdminListSection.helpers({
  countText: function (selector) {
    let collection = Template.instance().collection.get();
    let count = Template.instance().count.get();

    switch (selector) {
      case 'results':
        return count + (count == 1 ? ' match' : ' matches');
        break;
      case 'filters':
        return _.size(collection.filters) || '0';
        break;
      case 'fields':
        return _.size(collection.flattened) || '0';
        break;
      default:
        return '@'
    }
  },

  count: function (selector) {
    let collection = Template.instance().collection.get();
    let count = Template.instance().count.get();

    switch (selector) {
      case 'results':
        return count;
        break;
      case 'filters':
        return _.size(collection.filters) || 0;
        break;
      case 'fields':
        return _.size(collection.flattened) || 0;
        break;
      default:
        return '@'
    }
  },

  filtersList: function () {
    return Template.instance().collection.get().filters
  },

  query: function () {
    return Template.instance().collection.get().searchQuery || 'Search first and last name';
  },

  isCollection: function (collection) {
    return _.isEqual(collection, Template.instance().collection.get().name)
  }
});


// Functions

/**
 *
 * @param {Object} values
 * @param {Object} selectName
 */
function createOptionChildren(values, selectName) {
  let select = document.getElementById(selectName);

  // empty select input
  $(select).empty();

  // then append values
  if (!_.isEmpty(values)) {
    _.forEach(values, function (value, key) {
      $(select).append($('<option>', {
        value: key,
        text: value
      }));
    })
  }
}

function generateTable(template, options) {
  let collection = template.collection.get();
  let collCount = collection.instance.find(options.query, {fields: options.fields}).count();
  let list = collection.instance.find(options.query, {fields: options.fields}).fetch();
  let schema = collection.instance.simpleSchema();
  let count = template.count.get();
  let limit = template.limit.get();
  let skip = template.skip.get();
  let n_pages = Math.ceil(count / limit);

  let table = $('#participants_table');
  let tableHead = table.find('thead');
  let tableBody = table.find('tbody');

  let pagination = $('#participants_pagination');

  let flattened = {};
  let index = 0;

  // set select value
  $('#collection_select').val(collection.name);

  // get flattened object
  flattened = collection.flattened;

  // remove all
  tableHead.children().remove();
  tableBody.children().remove();


  // HEADER
  tableHead.append("<tr>");
  tableHead.append("<th class='animated fadeIn'>#</th>");

  _.forEach(flattened, function (value, key) {
    // get labels from schema schema
    tableHead.append("<th class='animated fadeIn'>" + (_.isNull(schema) ? key : schema.label(key)) + "</th>");
  });

  // button column
  tableHead.append("<th class='animated fadeIn'></th>");
  tableHead.append("</tr>");

  // BODY

  // if subscription return 0 objects then
  // do not event generate the table
  if (!_.isEqual(collCount, 0)) {
    _.forEach(list, function (row) {
      tableBody.append("<tr class='animated fadeIn'>");

      // count column
      tableBody.append("<th class='animated fadeIn' style='width: 30px;' scope=\"row\">" + ++index + "</th>");

      _.forEach(flattened, function (value, key) {
        let cell = deepFind(row, key);
        if (_.isEqual(key, 'statusComplete')) {
          tableBody.append("<td class='animated fadeIn' style='width: 30px;'><span class='sn-status " + (cell ? 'complete' : 'incomplete') + "'></span></td>");
        } else {
          tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
        }
      });


      tableBody.append(
        // "<a class='sn-tooltip' href title='See history'>" +
        // "<img src='/images/icons/timer.svg' class='sn-icon-1' id='sn-icon-copy'> " +
        // "</a> " +
        "<td class='animated fadeIn text-right'>" +

        // edit button only if participants
        (_.isEqual(collection.name, 'participants') ?
          "<button title='Edit' type='button' class='btn btn-secondary btn-sm sn-open-modal' data-modal-id='user-modal' data-user-id=" + deepFind(row, '_id') + ">Edit</button>" : "")
        + "<button title='Remove' type='button' class='ml-1 btn btn-secondary btn-sm' id='sn-delete-entry' name=" + deepFind(row, '_id') + ">Remove</button></td></tr>");

      // PAGINATION
      let currentPage = (skip / limit) + 1;
      pagination.children().remove();

      if (n_pages > 1) {
        pagination.append("<li class='page-item " + (_.isEqual(skip, 0) ? 'disabled' : '') + "'><a class='page-link pagination_item' name=" + (skip / limit) + " href tabindex='-1'>Previous</a></li>");

        if (currentPage > 3 && currentPage <= n_pages - 4 && n_pages > 7) {

          if (currentPage > 4) {
            pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");
          }

          for (let i = currentPage - 3; i < currentPage + 4; i++) {
            pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
          }

          pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");

        } else if (currentPage <= 3 && n_pages > 7) {
          for (let i = 1; i < 8; i++) {
            pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
          }
          pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");
        } else if (n_pages > 7) {
          pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");
          for (let i = n_pages - 6; i <= n_pages; i++) {
            pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
          }
        } else {
          for (let i = 1; i <= n_pages; i++) {
            pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
          }
        }

        pagination.append("<li class='page-item " + (_.isEqual(currentPage, n_pages) ? 'disabled' : '') + "'><a class='page-link pagination_item' name=" + ((skip / limit) + 2) + " href>Next</a></li>");

      }
    });
  } else {
    tableBody.append("<tr class='animated fadeIn'><td colspan=" + (2 + _.size(flattened)) + "><em>0 matches</em></td></tr>");

    // PAGINATION
    pagination.children().remove();
  }
  setCheckboxes(template);
}

function setCheckboxes(template) {
  let flattened = template.collection.get().flattened;

  _.forEach(flattened, function (value, key) {
    let id = key.replace(/\./g, '_');

    $('#' + id).prop('checked', true);
  });
}

function setSubscription(name, filters, search, flattened, limit, skip) {
  let query = {};

  _.forEach(filters, function (filter) {
    _.assign(query, filter)
  });

  if (search) {
    query['$or'] = [];

    _.forEach(fields.indices[name], function (key) {
      let field = {};
      field[key] = {$regex: search, $options: "i"};
      query['$or'].push(field)
    });
  }

  return {
    "query": query,
    "fields": flattened || {},
    "limit": _.toNumber(limit),
    "skip": _.toNumber((search ? 0 : skip))
  }
}

// MODAL TEMPLATE
Template.UserModal.onCreated(function () {
  this.autorun(() => {
    console.info('modal sub started');
    modalSub = Meteor.subscribe("participants.current", Session.get('_id'));
  });
  Session.set('userModalTab', 'UserModalParticipant');
});

Template.UserModal.onDestroyed(function () {
  console.info('modal sub destroyed');
  modalSub.stop();
});

Template.UserModal.events({
  'click input[data-field-type="checkbox"]': function (event, template) {
    let checked = event.target.checked;
    let field = _.toString($(event.currentTarget).attr('data-field'));
    let collection = $(event.currentTarget).attr('data-collection');
    let p = {_id: Session.get('_id')};
    p[field] = checked;
    switch (collection) {
      case 'participant':
        Meteor.call('participants.update', p, function (error, result) {
          if (error) swal('Error', error, 'error')
        });
        break;
      case 'user':
        Meteor.call('users.update', p, function (error, result) {
          if (error) swal('Error', error, 'error')
        });
        break;
      default:
        swal('Error', 'Wrong collection: ' + field, 'error');
        break
    }
  },

  'click .sn-modal-menu-item': (event, template) => {
    let tabId = $(event.currentTarget).attr('data-tab-id');
    switch (tabId) {
      case 'participant':
        Session.set('userModalTab', 'UserModalParticipant');
        break;
      case 'user':
        Session.set('userModalTab', 'UserModalUser');
        break;
      case 'host':
        Session.set('userModalTab', 'UserModalHost');
        break;
      case 'settings':
        Session.set('userModalTab', 'UserModalSettings');
        break;
      case 'history':
        Session.set('userModalTab', 'UserModalHistory');
        break;
    }
  },

  'click .sn-modal-edit': function (event, template) {
    let field = $(event.currentTarget).attr('data-field');
    let fieldType = $(event.currentTarget).attr('data-field-type');
    let collection = $(event.currentTarget).attr('data-collection');
    let currentValue, fields = {};
    fields[field] = 1;

    Meteor.call('participants.fields', Session.get('_id'), fields, function (error, result) {
      console.log(result, field);
      if (error) swal('Error', 'Cannot retrieve object\'s info', 'error');
      else {
        currentValue = deepFind(result, field);
        $(event.currentTarget)
        // remove 'edit' button, change text and add save class
          .removeClass('sn-modal-edit').text('Ok').addClass('sn-modal-save')
        // removes value
          .parent().prev(".col-sm-7").hide()
        // substitute with input
          .before('<dd class="col-sm-7"><input type="' + fieldType + '" placeholder="' + currentValue + '" class="sn-modal-field-input"></dd>').children(function () {
          console.log(this)
        }).focus();
      }
    });
  },
  'click .sn-modal-save': function (event, template) {
    let field = $(event.currentTarget).attr('data-field');
    let collection = $(event.currentTarget).attr('data-collection');
    let newValue = $(event.currentTarget).parent().prev(".col-sm-7").prev(".col-sm-7").children('.sn-modal-field-input').val();

    let fieldObj = {_id: Session.get('_id')};
    fieldObj[field] = newValue;

    switch (collection) {
      case 'user':
        Meteor.call('users.update', fieldObj, function (error, result) {
          if (error) swal('Error', error, 'error');
          else {
            $(event.currentTarget)
            // remove 'edit' button, change text and add save class
              .removeClass('sn-modal-save').text('Edit').addClass('sn-modal-edit')
            // removes value
              .parent().prev(".col-sm-7").show().prev(".col-sm-7").remove();
          }
        });
        break;
      case 'participant':
        Meteor.call('participants.update', fieldObj, function (error, result) {
          if (error) swal('Error', error, 'error');
          else {
            $(event.currentTarget)
            // remove 'edit' button, change text and add save class
              .removeClass('sn-modal-save').text('Edit').addClass('sn-modal-edit')
            // removes value
              .parent().prev(".col-sm-7").show().prev(".col-sm-7").remove();
          }
        });
        break;
      default:
        swal('error', 'Wrong collection', 'error');
        break;
    }

    $(event.currentTarget)
    // remove 'edit' button, change text and add save class
      .removeClass('sn-modal-save').text('Edit').addClass('sn-modal-edit')
    // removes value
      .parent().prev(".col-sm-7").show().prev(".col-sm-7").remove();
  }
});

Template.UserModal.helpers({
  user: function () {
    let userId = Session.get('_id');
    console.info('-> UserModal', Participants.findOne({_id: userId}));
    console.info('-> session _id', Session.get('_id'));
    return Participants.findOne({_id: userId});
  },
  isActive: function (section) {
    let tab = Session.get('userModalTab');
    if (_.isEqual(tab, section)) return 'sn-menu-item-active'
  },
  userModalTab: function () {
    return Session.get('userModalTab');
  },
});

// UserModalParticipant

Template.UserModalParticipant.onCreated(function () {
  console.info('participant sub started');
  modalSubParticipant = Meteor.subscribe("participants.current", Session.get('_id'));
});

Template.UserModalParticipant.helpers({
  user: function () {
    return Participants.findOne({_id: Session.get('_id')})
  }
});

Template.UserModalParticipant.onDestroyed(function () {
  console.info('participant sub destroyed');
  modalSubParticipant.stop();
});

// UserModalUser

Template.UserModalUser.onCreated(function () {
  console.info('user sub started');
  let userId = Template.instance().data._id;
  modalSubUser = Meteor.subscribe('users.one', userId);
  let ownerId = Template.instance().data.owner;
  modalSubOwner = Meteor.subscribe('users.one', ownerId);
});

Template.UserModalUser.helpers({
  user: function () {
    let userId = Session.get('_id'); // Template.instance().data._id
    return Meteor.users.findOne({_id: userId});
  },
  cp: function () {
    let ownerId = Template.instance().data.owner;
    return Meteor.users.findOne({_id: ownerId})
  }
});

Template.UserModalUser.onDestroyed(function () {
  console.info('user sub destroyed');
  modalSubUser.stop();
  modalSubOwner.stop();
});

// UserModalHost

Template.UserModalHost.helpers({
  host: function () {
    return Template.instance().data.host
  }
});

// UserModalHistory

Template.UserModalHistory.helpers({
  user: function () {
    return Template.instance().data
  }
});

// UserModalSettings

Template.UserModalSettings.events({
  'submit #settings-form': function (event, template) {
    event.preventDefault();

    // values from form elements
    const target = event.target;
    let hasStudentID = target.ask_student_id.checked;
    let hasPersonalID = target.ask_personal_id.checked;
    let userId = Template.instance().data._id;
    let item = [];

    if (hasPersonalID) item.push('hasPersonalID');
    if (hasStudentID) item.push('hasStudentID');

    // saving spinner
    $(target.save).text('Loading...');
    Meteor.call('settings.update', userId, 'form', 'doNotAsk', item, function (error, result) {
      if (error) swal('Error', error.message, 'error');
      else if (result.numberAffected == 1) swal('Success', 'Settings updated', 'success');
      else swal('Success', 'Result = ' + result, 'success');
      $(target.save).text('Save');
    });
  }
});

Template.UserModalSettings.onCreated(function () {
  let userId = Template.instance().data._id;
  Meteor.call('settings.get', userId, function (error, result) {
    if (result && result.form && result.form.doNotAsk) {
      _.forEach(result.form.doNotAsk, function (setting) {
        switch (setting) {
          case 'hasPersonalID':
            $('#ask_personal_id').prop('checked', true);
            break;
          case 'hasStudentID':
            $('#ask_student_id').prop('checked', true);
            break;
          default:
            break;
        }
      })
    }
  });
});

Template.UserModalSettings.onDestroyed(function () {
  // Clear form
  document.getElementById('settings-form').reset();
});