// utils.js
import wkt from 'wkt-parser';
import proj4 from 'proj4';

// Define el sistema de referencia de destino, en este caso, WGS84 (latitud/longitud)
const WGS84 = 'EPSG:4326';

// Define el sistema de referencia de origen, si es diferente de WGS84
const sourceCRS = 'EPSG:3857'; // Ejemplo: Coordenadas en proyección web mercator

export const transformWKTToLatLon = (wktString) => {
  const geoJSON = wkt(wktString);
  const coordinates = geoJSON.coordinates;

  // Si el WKT está en otro sistema de referencia, conviértelo a WGS84
  if (sourceCRS !== WGS84) {
    const [x, y] = coordinates;
    const [longitude, latitude] = proj4(sourceCRS, WGS84, [x, y]);
    return { latitude, longitude };
  }

  // Si ya está en WGS84, simplemente devuelve las coordenadas
  return { latitude: coordinates[1], longitude: coordinates[0] };
};
