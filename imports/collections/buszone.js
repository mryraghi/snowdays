import "babel-polyfill";
import SimpleSchema from "simpl-schema";

const BusZones =  new Mongo.Collection("buszone");

const Schemas = {};

Schemas.BusZone = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    name:{
        type: String,
    },
    initial_capacity: {
        type: String,
        max: 30,
    },
    current_capacity:{
        type:String
    },
    lat:{
        type:String
    },
    lng:{
        type:String
    },
    history: {
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

BusZones.attachSchema(Schemas.BusZone);
export default BusZones;