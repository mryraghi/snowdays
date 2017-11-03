import './admin.list.html'
import Participants from '/imports/collections/participants'
import Accommodations from '/imports/collections/accommodations'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import {deepFlatten, deepPick, deepFind} from '/lib/js/utilities'

let fields = require('/imports/collections/db_allowed_values.json');

const participantsIndices = {'firstName': 1, 'lastName': 1};
const accomIndices = {'name': 1, 'address':1, 'busZone':1};

const usersIndices = {'username': 1, 'profile.firstName': 1, 'profile.lastName': 1, 'roles': 1};


let raven = require('raven');
let client = new raven.Client('https://7b01834070004a4a91b5a7ed14c0b411:79de4d1bd9f24d1a93b78b18750afb54@sentry.io/126769', {
    environment: Meteor.settings.public.environment,
    server_name: 'snowdays',
    tags: {section: 'API'}
});

// catches all exceptions on the server
raven.patchGlobal(client);

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

    let template = Template.instance();

    template.flattenedFields = new ReactiveVar(participantsIndices);

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
        $.when(setSubscription(collection.filters, collection.searchQuery, collection.flattened)).done(function (options) {
            Meteor.subscribe(collection.name + ".all", options, () => {
                console.log(Participants.find().fetch());
                setTimeout(() => {
                    generateTable(template, options);
                }, 300);
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
            })
        }
        if (_.isEqual(collectionName, 'accommodations')) {
            template.collection.set({
                name: collectionName,
                instance: Accommodations,
                flattened: accomIndices,
                searchQuery: '',
                filters: []
            })
        }
        if (_.isEqual(collectionName, 'participants')) {
            template.collection.set({
                name: collectionName,
                instance: Participants,
                flattened: participantsIndices,
                searchQuery: '',
                filters: []
            })
        }
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

        console.log(value, fields[collection], deepFind(fields[collection], value.toString()));

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

        console.log(field, operation, value);


        // _.zipObject returns an object composed from key-value pairs
        if (_.isEqual(operation, 'e'))
            newFilter = _.zipObject([field], [{$eq: value}]);
        else
            newFilter = _.zipObject([field], [{$ne: value}]);

        currentFilters.push(newFilter);

        template.collection.set({
            name: collection.name,
            instance: collection.instance,
            flattened: collection.flattened,
            searchQuery: collection.searchQuery,
            filters: currentFilters
        });
    },

    /**
     * Deletes filters
     */
    'click #sn-delete-filter': (event, template) => {
        // get filter index
        let index = $(event.target).parent().attr("value");
        let collection = template.collection.get();
        let currentFilters = collection.filters;

        // remove from array at index
        _.pullAt(currentFilters, [index]);

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
                        $.when(setSubscription(collection.filters, collection.searchQuery, collection.flattened)).done(function (options) {
                            options['filename'] = filename;
                            options['download'] = download;
                            let encoded = jwt.sign(options, 'secret', {expiresIn: 60});
                            Meteor.setTimeout(function () {
                                Router.go('/csv/' + encoded);
                            }, 300)
                        })
                    })
                }
            }
        ];

        swal.queue(steps).then(function () {
            console.log('steps');
            swal.resetDefaults()
        })
    },

    'click #sn-delete-entry': function (event, template) {
        let _id = $(event.target).parent().attr("name");
        let collection = template.collection.get();

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
                else if (_.isEqual(0, result)) swal('Warning', 'Participant not removed!', 'warning');
                else {
                    generateTable(template)
                }
            })
        });
    }

});

Template.AdminListSection.helpers({
    count: function (selector) {
        let collection = Template.instance().collection.get();
        let options = setSubscription(collection.filters, collection.searchQuery, collection.flattened);

        switch (selector) {
            case 'results':
                let query = collection.instance.find(options.query, options.query).count();
                return query + (query > 1 ? ' participants' : ' participant');
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

    listIsEmpty: function () {
        let collection = Template.instance().collection.get();
        $.when(setSubscription(collection.filters, collection.searchQuery, collection.flattened)).done(function (options) {
            return _.isEqual(collection.instance.find(options.query, {fields: options.fields}).count(), 0)
        });
    },

    filtersList: function () {
        return Template.instance().collection.get().filters
    },

    query: function () {
        return Template.instance().collection.get().searchQuery || 'Search first name and last name';
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
    let list = collection.instance.find().fetch();
    let schema = collection.instance.simpleSchema();

    let table = $('#participants_table');
    let tableHead = table.find('thead');
    let tableBody = table.find('tbody');
    let flattened = {};
    let count = 0;

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

    tableHead.append("<th class='animated fadeIn'>Actions</th>");
    tableHead.append("</tr>");

    // BODY
    _.forEach(list, function (row) {
        tableBody.append("<tr class='animated fadeIn'>");

        // count column
        tableBody.append("<th class='animated fadeIn' scope=\"row\">" + ++count + "</th>");

        _.forEach(flattened, function (value, key) {
            let cell = deepFind(row, key);
            tableBody.append("<td class='animated fadeIn'>" + (_.isUndefined(cell) ? '–' : cell) + "</td>");
        });

        tableBody.append("<td class='animated fadeIn'>" +
            "<a class='sn-tooltip' href title='Edit'>" +
            "<img src='/images/icons/editing.svg' class='sn-icon-1' id='sn-icon-edit'> " +
            "</a>" +
            "<a class='sn-tooltip' href title='See history'>" +
            "<img src='/images/icons/timer.svg' class='sn-icon-1' id='sn-icon-copy'> " +
            "</a> " +
            "<a class='sn-tooltip' href title='Remove' name=" + deepFind(row, '_id') + "> " +
            "<img src='/images/icons/tool.svg' class='sn-icon-1' id='sn-delete-entry'> " +
            "</a>" +
            "</td>");
        tableBody.append("</tr>");
    });

    setCheckboxes(template);
}

function setCheckboxes(template) {
    let flattened = template.collection.get().flattened;

    _.forEach(flattened, function (value, key) {
        let id = key.replace(/\./g, '_');
        // console.log(id);

        $('#' + id).prop('checked', true);
    });
}

function setSubscription(filters, search, flattened) {
    let query = {};

    _.forEach(filters, function (filter) {
        _.assign(query, filter)
    });

    if (search) {
        query['$or'] = [];

        _.forEach(flattened, function (value, key) {
            // let field = {};
            // field[key] = search;
            // return query['$or'].push(field)
            let field = {};
            field[key] = {$regex: search, $options: "i"};
            return query['$or'].push(field)
        });
    }

    return {
        "query": query,
        "fields": flattened || {}
    }
}