var axios = require('axios');
var geolib = require('geolib');
var _ = require('lodash');

var radius = 400;
var truckUrl = 'http://foodtruckfiesta.com/apps/map_json.php?num_days=365&minimal=0&alert_nc=y&alert_hc=0&alert_pm=0&rand=1361925210';

var places = {
    'Franklin Square': {
        latitude: 38.902297, 
        longitude: -77.029788
    },
    'Farragut Square': {
        latitude: 38.902438, 
        longitude: -77.039257
    }
}

var truckAtLocation = function(placeLatLong, truckLatLong) {
    return geolib.isPointInCircle(
        truckLatLong,
        placeLatLong,
        radius
    );
};

var requestTruckData = function() {
    return axios.get(truckUrl)
        .then(function(response) {
            return response.data.markers;
        });
};

var getTrucksForLocation = function(locationName, data) {
    return _.chain(data)
        .filter(function(truck) {
        return truckAtLocation(
            _.get(places, locationName),{
                latitude: truck.coord_lat,
                longitude: truck.coord_long
            })
        })
        .map('print_name')
        .uniq()
        .value()
}

var locationToString = function(trucksArray, location) {
    var s = "\n*" + location + "*\n";
    s = s + trucksArray.join("\n")
    s = s + "\n"
    return s;
}

module.exports = function(robot) {
    robot.respond(/truck me/i, function(msg){
        var truckString = '_Here are the trucks near you!_';
        
        requestTruckData()
            .then(function(truckData) {
                _.forEach(places, function(value, key) {
                    var trucks = getTrucksForLocation(key, truckData)
                    truckString += locationToString(trucks, key)
                })
                msg.reply(truckString)
            })
    });
};