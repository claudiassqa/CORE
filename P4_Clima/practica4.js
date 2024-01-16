const {readFile} = require('fs').promises;

exports.load = async (citiesFilename) => {
    const ciudades = await readFile(citiesFilename, "utf-8");
    return JSON.parse(ciudades);
}

exports.maxTemp = (cities) => {
    const temperaturas = cities.map(city => city.main.temp);
    let max = temperaturas[0];
    for (let i = 0; i < temperaturas.length; i++){
        if (temperaturas[i] > max){
            max = temperaturas[i];
        }
    }
    return max;
}

exports.minTemp = (cities) => {
    const temperaturas = cities.map(city => city.main.temp);
    let min = temperaturas[0];
    for (let i = 0; i < temperaturas.length; i++){
        if (temperaturas[i] < min){
            min = temperaturas[i];
        }
    }
    return min;
}

exports.maxTempMin = (cities) => {
    const temperaturas_minimas = cities.map(city => city.main.temp_min);
    let max = temperaturas_minimas[0];
    for (let i = 0; i < temperaturas_minimas.length; i++){
        if (temperaturas_minimas[i] > max){
            max = temperaturas_minimas[i];
        }
    }
    return max;
}

exports.minTempMax = (cities) => {
    const temperaturas_maximas = cities.map(city => city.main.temp_max);
    let min = temperaturas_maximas[0];
    for (let i = 0; i < temperaturas_maximas.length; i++){
        if (temperaturas_maximas[i] < min){
            min = temperaturas_maximas[i];
        }
    }
    return min;
}

exports.averageTemp = (cities) => {
    const temperaturas = cities.map(city => city.main.temp);
    let total = temperaturas.length;
    let suma = 0;
    let aux = 0;
    while (aux < total){
        suma = suma + temperaturas[aux++];
    }
    return suma/total;
}

exports.warmerAverageTemp = (cities) => {
    const temperaturas = cities.map(city => city.main.temp);
    let total = temperaturas.length;
    let suma = 0;
    let aux = 0;
    while (aux < total){
        suma = suma + temperaturas[aux++];
    }
    let media = suma/total;
    const ciudades = cities.filter(city => city.main.temp > media);
    return ciudades.map(city => city.name);
}

exports.maxNorth = (cities) => {
    const latitudes = cities.map(city => city.coord.lat);
    let max = Math.max.apply(null, latitudes);
    const ciuNor = cities.find(city => (city.coord.lat === max));
    return ciuNor.name;
}


exports.maxSouth = (cities) => {
    const latitudes = cities.map(city => city.coord.lat);
    let max = Math.min.apply(null, latitudes);
    const ciuSur = cities.find(city => (city.coord.lat === max));
    return ciuSur.name;
}

exports.gravityCenter = (cities) => {
    const latitudes = cities.map(city => city.coord.lat);
    const longitudes = cities.map(city => city.coord.lon);

    //media latitudes
    let sumLat = 0;
    for (let i = 0; i < latitudes.length; i++){
        sumLat = sumLat + latitudes[i];
    }
    const mediaLat = sumLat/latitudes.length;

    let sumLon = 0;
    for (let i = 0; i < longitudes.length; i++){
        sumLon = sumLon + longitudes[i];
    }
    const mediaLon = sumLon/longitudes.length;

    return {
        lat: mediaLat,
        lon: mediaLon,
    };

}

exports.closestGC = (cities) => {
    getKilometros = (lat1,lon1,lat2,lon2) => {
        rad = function(x) {return x*Math.PI/180;}
        const R = 6378.137;
        let dLat = rad(lat2 - lat1);
        let dLong = rad(lon2 - lon1);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        return d.toFixed(3);
    }

    let centro=this.gravityCenter(cities);
    let min = Infinity;
    let indice = 0;
    for (let i= 0; i < cities.length; i++){
        if(parseInt(getKilometros(centro.lat, centro.lon,cities[i].coord.lat, cities[i].coord.lon)) < min){
            min = parseInt(getKilometros(centro.lat, centro.lon,cities[i].coord.lat, cities[i].coord.lon));
            indice = i;
        }
    }
    return cities[indice].name;
}