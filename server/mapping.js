import { Meteor } from 'meteor/meteor';
import Accommodations from '/imports/collections/accommodations';
class mapResult {
  origin; 
  destination;
  distanceTxt;
  durationTxt;
  distance;
  duration;

}

class geocodingResult{
  lat;
  lng;
}
Meteor.methods({
    evaluateAccomodation(Id){
        console.log('Eval: '+Id);
        var arrBusestops= ['46.49785, 11.3517','46.50305, 11.33438','46.49253, 11.32153'];
        var arrComo=Accommodations.findOne({ _id:Id });
        var coordinates;
        if(arrComo.coordinates=="")
        {
          var geoResult=geocoding(arrComo.address);
          Accommodations.update({_id:Id}, { $set: { coordinates: geoResult.lat+","+geoResult.lng }});
          coordinates= geoResult.lat+","+geoResult.lng;
        }
        else
        {
            coordinates=arrComo.coordinates;
        }

        console.log('Coord: '+coordinates);
        var minTime=99999999;
        var indBus=-1;
        for (var index = 0; index < arrBusestops.length; index++) {
            var busCoordinates = arrBusestops[index];
            
            var mapResult=evalWalkDistance(coordinates, busCoordinates);
            if(mapResult.duration<minTime)
            {
                minTime=mapResult.duration;
                indBus=index;
                
            }

            
        }
        Accommodations.update({_id:Id}, { $set: { busZone: indBus+1 }});
        console.log('updated: '+Id+' - BZ:'+(index+1));

        return true;
    }

  });


  function geocoding (address) {
    //this.unblock();
    var key='AIzaSyAmnTiUl8GlHY5vy6lelf9NtaT1IE5Xg0E';

    //call Google
    var response = HTTP.call( 'GET',
    'https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key='+key, {} );
    var serverResult=JSON.parse( response.content); //parse to Object
    var gr= new geocodingResult();
    gr.lat= serverResult.results[0].geometry.location.lat
    gr.lng= serverResult.results[0].geometry.location.lng;
    return gr;
  }

  function evalWalkDistance (origin, destination) {
    //this.unblock();
    var key='AIzaSyAmnTiUl8GlHY5vy6lelf9NtaT1IE5Xg0E';

    //call Google
    var response = HTTP.call( 'GET',
     'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+origin+
     '&destinations='+destination+'&mode=walking&units=metric&language=en&avoid=&key='+key, {} );
    var serverResult=JSON.parse( response.content); //parse to Object
    var map = new mapResult(); //convert to mapResult
    map.origin=  serverResult.origin_addresses;
    map.destination=serverResult.destination_addresses;
    map.distanceTxt=serverResult.rows[0].elements[0].distance.text;
    map.distance=serverResult.rows[0].elements[0].distance.value;
    map.durationTxt=serverResult.rows[0].elements[0].duration.text;
    map.duration=serverResult.rows[0].elements[0].duration.value;
    return map;
  }