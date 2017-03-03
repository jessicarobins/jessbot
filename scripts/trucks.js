var axios = require('axios');
var geolib = require('geolib');
var _ = require('lodash');

var radius = 500;

var places = {
    'franklin square': {
        latitude: 38.902297, 
        longitude: -77.029788
    }
}

var truckAtLocation = function(placeLatLong, truckLatLong) {
    return geolib.isPointInCircle(
        truckLatLong,
        placeLatLong,
        radius
    );
}

module.exports = function(robot) {
    robot.respond(/truck me/i, function(msg){

        msg.reply("truck!");
        
        axios.get('http://foodtruckfiesta.com/apps/map_json.php?num_days=365&minimal=0&alert_nc=y&alert_hc=0&alert_pm=0&rand=1361925210')
            .then(function(response) {
                var truckData = response.data.markers;
                const trucks = _.chain(truckData)
                    .filter(function(truck) {
                    return truckAtLocation(
                        _.get(places, 'franklin square'),{
                            latitude: truck.coord_lat,
                            longitude: truck.coord_long
                        })
                    })
                    .map('print_name')
                    .uniq()
                    .value()
                var truckString = trucks.join("\n")
                msg.reply(trucks)
            })
    });
};