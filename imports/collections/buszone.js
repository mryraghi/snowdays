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
    }
});

BusZones.attachSchema(Schemas.BusZone);
export default BusZones;