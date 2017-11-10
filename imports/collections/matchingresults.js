import "babel-polyfill";
import SimpleSchema from "simpl-schema";
import _ from "lodash";

const Matchingresults = new Mongo.Collection("matchingresults");

const Schemas = {};

Schemas.Matchingresults = new SimpleSchema({
_id: {
    type: String
},
host: {
    type: String,
        optional: true
},
hostPhoneNumber: {
    type: String,
        max: 30,
},
Room: {
    type: String,
    max: 30,
},
GuestFirstName: {
    type: String,
        max: 30,
        index: 1,
        optional: true
},
GuestLastName: {
    type: String,
    max: 30,
    index: 1,
    optional: true
}, 
GuestPhoneNumber: {
    type: String,
    max: 30,
    index: 1,
    optional: true
}, 
GuestEmail: {
    type: String,
    max: 30,
    index: 1,
    optional: true
}, 
University: {
    type: String,
    max: 30,
    index: 1,
    optional: true
}, 
Accommodation: {
    type: String,
    max: 30,
    index: 1,
    optional: true
}, history: {
        type: Array,
        optional: true,
        autoValue: function () {
            if (this.isUpdate) {
                return {
                    $push: {
                        date: new Date,
                        updates: {}
                    }
                };
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    },
    'history.$': {
        type: Object,
    },
    'history.$.date': {
        type: Date,
        optional: true
    },
    'history.$.updates': {
        type: Object,
        optional: true
    },
    'history.$.updates.field': {
        type: String,
        optional: true
    },
    'history.$.updates.value': {
        type: String,
        optional: true
    },
    token: {
        type: String,
        optional: true
    },
    statusComplete: {
        type: Boolean,
        label: '',
        defaultValue: false,
        optional: true
    },
    hasAcceptedTandC: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    createdAt: {
        type: Date,
        defaultValue: new Date(),
        denyUpdate: true,
        optional: true
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    }
}, {
    clean: {
        filter: true,
        autoConvert: true,
        removeEmptyStrings: true,
        trimStrings: true,
        getAutoValues: true,
        removeNullsFromArrays: true,
    }
});
Matchingresults.attachSchema(Schemas.Matchingresults);
export default Matchingresults;