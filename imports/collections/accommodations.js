import "babel-polyfill";
import SimpleSchema from "simpl-schema";
import _ from "lodash";

const Accommodations = new Mongo.Collection("accommodations");

const Schemas = {};

Schemas.Accommodation = new SimpleSchema({
_id: {
    type: String,
        regEx: SimpleSchema.RegEx.Id
},
name: {
    type: String,
        optional: true
},
address: {
    type: String,
        max: 30,
},
coordinates: {
    type: String,
        max: 30,
        index: 1,
        optional: true
},
busZone: {
    type: String,
        allowedValues: [1, 2, 3],
        optional: true
},
capacity: {
    type: String,
        max: 10,
        optional: false
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
Accommodations.attachSchema(Schemas.Accommodation);
export default Accommodations;