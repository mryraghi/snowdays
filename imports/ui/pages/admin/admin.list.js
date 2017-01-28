import './admin.list.html'
import Participants from '/imports/collections/participants'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import {deepPick, deepFind} from '/lib/js/utilities'

let fields = require('/imports/collections/db_allowed_values.json');

const participantsIndices = {'statusComplete': 1, 'firstName': 1, 'lastName': 1};

const usersIndices = {'username': 1, 'profile.firstName': 1, 'profile.lastName': 1, 'roles': 1};


let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
  environment: Meteor.settings.public.environment,
  server_name: 'snowdays',
  tags: {section: 'API'}
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
        Meteor.call(collection.name + '.count', function (error, count) {
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
    let value = event.target.value;
    let collection = template.collection.get().name;

    // deep find in object, returns values allowed
    let allowed = deepFind(fields[collection], value) || deepFind(fields['common'], value) || deepFind(fields['common'], 'boolean');

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
      if (_.isEqual(operation, 'e'))
        newFilter = _.zipObject([field], [{$eq: value}]);
      else
        newFilter = _.zipObject([field], [{$ne: value}]);

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
      template.find("#add_filter_form").reset();
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
              Meteor.setTimeout(function () {
                Router.go('/csv/' + encoded);
              }, 300);
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

  'click #sn-icon-edit': function (event, template) {
    let _id = $(event.target).attr("name");

    Session.set('_id', _id);
    Session.set('tab', 'UserFormSection');
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
    let skip = template.skip.get();

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
      tableBody.append("<th class='animated fadeIn' scope=\"row\">" + ++index + "</th>");

      _.forEach(flattened, function (value, key) {
        let cell = deepFind(row, key);
        if (_.isEqual(key, 'statusComplete')) {
          tableBody.append("<td class='animated fadeIn'><span class='sn-status " + (cell ? 'complete' : 'incomplete') + "'></span></td>");
        } else {
          tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
        }
      });


      tableBody.append(
        // "<a class='sn-tooltip' href title='See history'>" +
        // "<img src='/images/icons/timer.svg' class='sn-icon-1' id='sn-icon-copy'> " +
        // "</a> " +
        "<td class='animated fadeIn'>" +

        // edit button only if participants
        (_.isEqual(collection.name, 'participants') ? "" +
          "<a class='sn-tooltip' href title='Edit' id='sn-icon-edit' name=" + deepFind(row, '_id') + ">" +
          "<img src='/images/icons/editing.svg' class='sn-icon-1'></a>" : "") +

        "<a class='sn-tooltip' href title='Remove' id='sn-delete-entry' name=" + deepFind(row, '_id') + "> " +
        "<img src='/images/icons/tool.svg' class='sn-icon-1'> " +
        "</a></td></tr>");

      // PAGINATION
      let currentPage = (skip / limit) + 1;
      pagination.children().remove();

      pagination.append("<li class='page-item " + (_.isEqual(skip, 0) ? 'disabled' : '') + "'><a class='page-link pagination_item' name=" + (skip / limit) + " href tabindex='-1'>Previous</a></li>");

      if (currentPage > 3 && currentPage <= n_pages - 4) {
        pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");

        for (let i = currentPage - 3; i < currentPage + 4; i++) {
          pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
        }

        pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");

      } else if (currentPage <= 3) {
        for (let i = 1; i < 5; i++) {
          pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
        }
        pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");
      } else {
        pagination.append("<li class='page-item disabled'><a class='page-link pagination_item' href>...</a></li>");
        for (let i = n_pages - 3; i <= n_pages; i++) {
          pagination.append("<li class='page-item " + (_.isEqual(currentPage, i) ? 'active' : '') + "'><a class='page-link pagination_item' name=" + i + " href>" + i + "</a></li>");
        }
      }

      pagination.append("<li class='page-item " + (_.isEqual(currentPage, n_pages) ? 'disabled' : '') + "'><a class='page-link pagination_item' name=" + ((skip / limit) + 2) + " href>Next</a></li>");

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