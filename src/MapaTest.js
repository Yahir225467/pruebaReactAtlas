import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import './Mapa.css';
import EstadoIndicador from './EstadoIndicador';
import Modal from 'react-modal';
import Legend from './Legend';
import debounce from 'lodash/debounce';

Modal.setAppElement('#root');

// Corregir el problema del icono por defecto en Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Función para determinar el color según el valor del indicador
const getColor = (value) => {
  if (value === null || value === undefined) {
    return 'rgba(0, 0, 0, 0.0)'; // Transparente para valores no definidos
  }
  switch (value) {
    case 1:
      return 'rgba(144, 232, 82, 0.8)';  // Verde con 80% de opacidad
    case 2:
      return 'rgba(241, 255, 64, 0.8)';  // Amarillo con 80% de opacidad
    case 3:
      return 'rgba(255, 0, 0, 0.8)';     // Rojo con 80% de opacidad
    case 4:
      return 'rgba(255, 255, 255, 0.8)'; // Blanco con 80% de opacidad
    case 5:
      return 'rgba(176, 176, 176, 0.8)'; // Gris con 80% de opacidad
    default:
      return 'rgba(0, 0, 0, 0.8)';       // Negro con 80% de opacidad para valores desconocidos
  }
};

const uniqueSortedMunicipios = (data) => {
  const municipiosSet = new Set(data.map(item => item.NOMGEO));
  return Array.from(municipiosSet).sort((a, b) => a.localeCompare(b));
};

// Componente para manejar el zoom al municipio seleccionado
const ZoomToFeature = ({ feature, bringToFront }) => {
  const map = useMap();

  useEffect(() => {
    if (feature) {
      const coordinates = feature.geom.map(coord => [coord[1], coord[0]]);
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds);

      if (bringToFront) {
        L.polygon(coordinates).bringToFront();
      }
    }
  }, [feature, map, bringToFront]);

  return null;
};

// Componente para capturar el nivel de zoom del mapa
const CaptureZoomLevel = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom());
    },
  });

  return null;
};

// Mapa de indicadores a nombres y tipos
const indicatorMap = {
  // ... (el mismo contenido de indicatorMap)
};

const Mapa = () => {
  const [data, setData] = useState([]);
  const [planeacionData, setPlaneacionData] = useState([]);
  const [contraloriaData, setContraloriaData] = useState([]);
  const [capacitacionData, setCapacitacionData] = useState([]);
  const [hoveredMunicipio, setHoveredMunicipio] = useState('');
  const [ingresosData, setIngresosData] = useState([]);
  const [egresosData, setEgresosData] = useState([]);
  const [disciplinaFinancieraData, setDisciplinaFinancieraData] = useState([]);
  const [patrimonioData, setPatrimonioData] = useState([]);
  const [desarrolloUrbanoData, setDesarrolloUrbanoData] = useState([]);
  const [ordenamientoEcologicoData, setOrdenamientoEcologicoData] = useState([]);
  const [proteccionCivilData, setProteccionCivilData] = useState([]);
  const [coordinacionUrbanaData, setCoordinacionUrbanaData] = useState([]);
  const [marcoNormativoData, setMarcoNormativoData] = useState([]);
  const [diagnosticoData, setDiagnosticoData] = useState([]);
  const [accionesData, setAccionesData] = useState([]);
  const [EvaluacionData, setEvaluacionData] = useState([]);
  const [preservacionData, setPreservacionData] = useState([]);
  const [cambioClimaticoData, setCambioClimaticoData] = useState([]);
  const [serviciosData, setServiciosData] = useState([]);
  const [educacionData, setEducacionData] = useState([]);
  const [saludData, setSaludData] = useState([]);
  const [gruposData, setGruposData] = useState([]);
  const [igualdadData, setIgualdadData] = useState([]);
  const [juventudData, setJuventudData] = useState([]);
  const [deporteData, setDeporteData] = useState([]);
  const [mejoraData, setMejoraData] = useState([]);
  const [vocacionData, setVocacionData] = useState([]);
  const [fomentoData, setFomentoData] = useState([]);
  const [transparenciaData, setTransparenciaData] = useState([]);
  const [participacionData, setParticipacionData] = useState([]);
  const [eticaData, setEticaData] = useState([]);
  //------agregar tema aquí---//
  const [hoveredValue, setHoveredValue] = useState(null);
  const [hoveredPolygon, setHoveredPolygon] = useState(null);
  const [selectedModule, setSelectedModule] = useState('M1');
  const [selectedTheme, setSelectedTheme] = useState('M1_1');
  const [selectedIndicator, setSelectedIndicator] = useState('M1_1_1');
  const [selectedYear, setSelectedYear] = useState('23');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [bringToFront, setBringToFront] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [indicatorName, setIndicatorName] = useState('');
  const [indicatorType, setIndicatorType] = useState('');
  const [zoomLevel, setZoomLevel] = useState(8);

  const themeMap = {
    // ... (el mismo contenido de themeMap)
  };

  // Función para obtener los datos y mostrarlos de manera visual
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          'indicadores_M1_estructura',
          'indicadores_M1_planeacion',
          'indicadores_M1_contraloria',
          'indicadores_M1_capacitacion',
          'indicadores_M2_ingresos',
          'indicadores_M2_egresos',
          'indicadores_M2_disciplina_financiera',
          'indicadores_M2_patrimonio',
          'indicadores_M3_desarrollo_urbano',
          'indicadores_M3_ordenamiento_ecologico',
          'indicadores_M3_proteccion_civil',
          'indicadores_M3_coordinacion_urbana',
          'indicadores_M4_marco_normativo',
          'indicadores_M4_diagnostico',
          'indicadores_M4_acciones',
          'indicadores_M4_evaluacion',
          'indicadores_M5_preservacion',
          'indicadores_M5_cambio_climatico',
          'indicadores_M5_servicios',
          'indicadores_M6_educacion',
          'indicadores_M6_salud',
          'indicadores_M6_grupos',
          'indicadores_M6_igualdad',
          'indicadores_M6_juventud',
          'indicadores_M6_deporte',
          'indicadores_M7_mejora',
          'indicadores_M7_vocacion',
          'indicadores_M7_fomento',
          'indicadores_M8_transparencia',
          'indicadores_M8_participacion',
          'indicadores_M8_etica'
          //------agregar tema aquí---//
        ];
  
        const responses = await Promise.all(endpoints.map(endpoint =>
          axios.get(`http://127.0.0.1:3001/${endpoint}`).catch(error => ({ error }))
        ));
  
        const convertData = (data) => data.map(item => ({
          ...item,
          geom: item.geom.map(coord => [coord[1], coord[0]]) // Convertir directamente a [lat, lng]
        }));
  
        const processData = (response, setDataFunc) => {
          if (response.error) {
            console.error(`Error fetching data from ${response.error.config.url}: ${response.error.message}`);
            setDataFunc([]);
          } else {
            setDataFunc(convertData(response.data || []));
          }
        };
  
        processData(responses[0], setData);
        processData(responses[1], setPlaneacionData);
        processData(responses[2], setContraloriaData);
        processData(responses[3], setCapacitacionData);
        processData(responses[4], setIngresosData);
        processData(responses[5], setEgresosData);
        processData(responses[6], setDisciplinaFinancieraData);
        processData(responses[7], setPatrimonioData);
        processData(responses[8], setDesarrolloUrbanoData);
        processData(responses[9], setOrdenamientoEcologicoData);
        processData(responses[10], setProteccionCivilData);
        processData(responses[11], setCoordinacionUrbanaData);
        processData(responses[12], setMarcoNormativoData);
        processData(responses[13], setDiagnosticoData);
        processData(responses[14], setAccionesData);
        processData(responses[15], setEvaluacionData);
        processData(responses[16], setPreservacionData);
        processData(responses[17], setCambioClimaticoData);
        processData(responses[18], setServiciosData);
        processData(responses[19], setEducacionData);
        processData(responses[20], setSaludData);
        processData(responses[21], setGruposData);
        processData(responses[22], setIgualdadData);
        processData(responses[23], setJuventudData);
        processData(responses[24], setDeporteData);
        processData(responses[25], setMejoraData);
        processData(responses[26], setVocacionData);
        processData(responses[27], setFomentoData);
        processData(responses[28], setTransparenciaData);
        processData(responses[29], setParticipacionData);
        processData(responses[30], setEticaData);
        //------agregar tema aquí---//
      } catch (error) {
        console.error('Error al obtener datos del backend:', error);
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
    const indicatorKey = selectedIndicator;
    const { nombre } = indicatorMap[indicatorKey] || { nombre: 'Desconocido' };
    setIndicatorName(nombre);
  }, [selectedIndicator]);

  const handleModuleChange = useCallback((event) => {
    const module = event.target.value;
    setSelectedModule(module);
    setSelectedTheme(`${module}_1`);
    setSelectedIndicator(`${module}_1_1`);
  }, []);

  const handleThemeChange = useCallback((event) => {
    const theme = event.target.value;
    setSelectedTheme(theme);
    setSelectedIndicator(`${theme}_1`);
  }, []);

  const handleIndicatorChange = useCallback((event) => {
    setSelectedIndicator(event.target.value);
  }, []);

  const handleYearChange = useCallback((event) => {
    setSelectedYear(event.target.value);
  }, []);

  const debouncedSearchChange = useCallback(debounce((value) => {
    setSearchTerm(value);
  }, 300), []);

  const handleSearchChange = useCallback((event) => {
    const selectedMunicipio = event.target.value;
    setSearchTerm(selectedMunicipio);
    //------agregar tema aquí---//
    const feature = [
      ...data,
      ...planeacionData,
      ...contraloriaData,
      ...capacitacionData,
      ...ingresosData,
      ...egresosData,
      ...disciplinaFinancieraData,
      ...patrimonioData,
      ...desarrolloUrbanoData,
      ...ordenamientoEcologicoData,
      ...proteccionCivilData,
      ...coordinacionUrbanaData,
      ...marcoNormativoData,
      ...diagnosticoData,
      ...accionesData,
      ...EvaluacionData,
      ...preservacionData,
      ...cambioClimaticoData,
      ...serviciosData,
      ...educacionData,
      ...saludData,
      ...gruposData,
      ...igualdadData,
      ...juventudData,
      ...deporteData,
      ...mejoraData,
      ...vocacionData,
      ...fomentoData,
      ...transparenciaData,
      ...participacionData,
      ...eticaData
      //------agregar tema aquí---//
    ].find(item => item.NOMGEO === selectedMunicipio);

    if (feature) {
      setSelectedFeature(feature);
      setBringToFront(true);
      const indicatorKey = selectedIndicator;
      const { nombre, tipo } = indicatorMap[indicatorKey] || { nombre: 'Desconocido', tipo: 'Desconocido' };
      setIndicatorName(nombre);
      setIndicatorType(tipo);
    }
  }, [
    data,
    planeacionData,
    contraloriaData,
    capacitacionData,
    ingresosData,
    egresosData,
    disciplinaFinancieraData,
    patrimonioData,
    desarrolloUrbanoData,
    ordenamientoEcologicoData,
    proteccionCivilData,
    coordinacionUrbanaData,
    marcoNormativoData,
    diagnosticoData,
    accionesData,
    EvaluacionData,
    preservacionData,
    cambioClimaticoData,
    serviciosData,
    educacionData,
    saludData,
    gruposData,
    igualdadData,
    juventudData,
    deporteData,
    mejoraData,
    vocacionData,
    fomentoData,
    transparenciaData,
    participacionData,
    eticaData,
    //------agregar tema aquí---//
    selectedIndicator
  ]);

  const handleMouseOver = useCallback((e, item, index) => {
    const indicatorKey = selectedIndicator;
    const value = item[indicatorKey];
    if (value !== undefined && value !== null) {
      setHoveredMunicipio(item.NOMGEO);
      setHoveredValue(value);
      setHoveredPolygon(index);
      e.target.setStyle({
        color: 'white',
        weight: 3,
      });
      e.target.bringToFront();
    }
  }, [selectedIndicator]);

  const handleMouseOut = useCallback((e) => {
    setHoveredMunicipio('');
    setHoveredValue(null);
    setHoveredPolygon(null);
    e.target.setStyle({
      color: 'black',
      weight: 1,
    });
    if (selectedFeature) {
      const coordinates = selectedFeature.geom.map(coord => [coord[1], coord[0]]);
      L.polygon(coordinates).bringToFront();
    }
  }, [selectedFeature]);

  const handlePolygonClick = useCallback((item) => {
    const indicatorKey = selectedIndicator;
    const { nombre, tipo } = indicatorMap[indicatorKey] || { nombre: 'Desconocido', tipo: 'Desconocido' };
    setIndicatorName(nombre);
    setIndicatorType(tipo);
    const cleanedChartData = [
      item[`${indicatorKey}_20`],
      item[`${indicatorKey}_21`],
      item[`${indicatorKey}_22`],
      item[`${indicatorKey}_23`]
    ].map(value => (value === undefined || value === null ? 0 : value));
    setChartData(cleanedChartData);
    setSelectedFeature(item);
    setModalIsOpen(true);
  }, [selectedIndicator]);

  const getThemesForModule = useCallback((module) => {
    if (module === 'M1') {
      return ['M1_1', 'M1_2', 'M1_3', 'M1_4'];
    } else if (module === 'M2') {
      return ['M2_1', 'M2_2', 'M2_3', 'M2_4'];
    } else if (module === 'M3') {
      return ['M3_1', 'M3_2', 'M3_3', 'M3_4'];
    } else if (module === 'M4') {
      return ['M4_1', 'M4_2', 'M4_3', 'M4_4'];
    } else if (module === 'M5') {
      return ['M5_1', 'M5_2', 'M5_3'];
    } else if (module === 'M6') {
      return ['M6_1', 'M6_2', 'M6_3', 'M6_4', 'M6_5', 'M6_6'];
    } else if (module === 'M7') {
      return ['M7_1', 'M7_2', 'M7_3'];
    } else if (module === 'M8') {
      return ['M8_1', 'M8_2', 'M8_3'];
    }
    //------agregar tema aquí---//
    return [];
  }, []);

  const getIndicatorsForTheme = useCallback((theme) => {
    if (theme.startsWith('M1_')) {
      // Indicadores de Módulo 1
      if (theme === 'M1_1') return ['M1_1_1', 'M1_1_2', 'M1_1_3', 'M1_1_4', 'M1_1_5', 'M1_1_6', 'M1_1_7'];
      if (theme === 'M1_2') return ['M1_2_1', 'M1_2_2', 'M1_2_3', 'M1_2_4'];
      if (theme === 'M1_3') return ['M1_3_1', 'M1_3_2', 'M1_3_3'];
      if (theme === 'M1_4') return ['M1_4_1', 'M1_4_2', 'M1_4_3'];
    } else if (theme.startsWith('M2_')) {
      // Indicadores de Módulo 2
      if (theme === 'M2_1') return ['M2_1_1', 'M2_1_2', 'M2_1_3', 'M2_1_4', 'M2_1_5', 'M2_1_6', 'M2_1_7'];
      if (theme === 'M2_2') return ['M2_2_1', 'M2_2_2', 'M2_2_3', 'M2_2_4', 'M2_2_5'];
      if (theme === 'M2_3') return ['M2_3_1', 'M2_3_2', 'M2_3_3', 'M2_3_4'];
      if (theme === 'M2_4') return ['M2_4_1', 'M2_4_2', 'M2_4_3'];
    } else if (theme.startsWith('M3_')) {
      // Indicadores de Módulo 3
      if (theme === 'M3_1') return ['M3_1_1', 'M3_1_2', 'M3_1_3', 'M3_1_4'];
      if (theme === 'M3_2') return ['M3_2_1', 'M3_2_2', 'M3_2_3', 'M3_2_4'];
      if (theme === 'M3_3') return ['M3_3_1', 'M3_3_2', 'M3_3_3', 'M3_3_4', 'M3_3_5', 'M3_3_6'];
      if (theme === 'M3_4') return ['M3_4_1', 'M3_4_2', 'M3_4_3'];
    } else if (theme.startsWith('M4_')) {
      // Indicadores de Módulo 4
      if (theme === 'M4_1') return ['M4_1_1', 'M4_1_2'];
      if (theme === 'M4_2') return ['M4_2_1', 'M4_2_2', 'M4_2_3', 'M4_2_4'];
      if (theme === 'M4_3') return ['M4_3_1', 'M4_3_2'];
      if (theme === 'M4_4') return ['M4_4_1', 'M4_4_2', 'M4_4_3', 'M4_4_4', 'M4_4_5', 'M4_4_6', 'M4_4_7', 'M4_4_8', 'M4_4_9', 'M4_4_10'];
    } else if (theme.startsWith('M5_')) {
      // Indicadores de Módulo 5
      if (theme === 'M5_1') return ['M5_1_1', 'M5_1_2'];
      if (theme === 'M5_2') return ['M5_2_1', 'M5_2_2', 'M5_2_3', 'M5_2_4'];
      if (theme === 'M5_3') return ['M5_3_1', 'M5_3_2', 'M5_3_3', 'M5_3_4'];
    } else if (theme.startsWith('M6_')) {
      // Indicadores de Módulo 6
      if (theme === 'M6_1') return ['M6_1_1', 'M6_1_2', 'M6_1_3'];
      if (theme === 'M6_2') return ['M6_2_1', 'M6_2_2', 'M6_2_3'];
      if (theme === 'M6_3') return ['M6_3_1', 'M6_3_2'];
      if (theme === 'M6_4') return ['M6_4_1', 'M6_4_2', 'M6_4_3', 'M6_4_4'];
      if (theme === 'M6_5') return ['M6_5_1', 'M6_5_2'];
      if (theme === 'M6_6') return ['M6_6_1', 'M6_6_2'];
    } else if (theme.startsWith('M7_')) {
      // Indicadores de Módulo 7
      if (theme === 'M7_1') return ['M7_1_1', 'M7_1_2', 'M7_1_3', 'M7_1_4'];
      if (theme === 'M7_2') return ['M7_2_1', 'M7_2_2', 'M7_2_3'];
      if (theme === 'M7_3') return ['M7_3_1', 'M7_3_2', 'M7_3_3'];
    } else if (theme.startsWith('M8_')) {
      // Indicadores de Módulo 8
      if (theme === 'M8_1') return ['M8_1_1', 'M8_1_2', 'M8_1_3', 'M8_1_4'];
      if (theme === 'M8_2') return ['M8_2_1', 'M8_2_2'];
      if (theme === 'M8_3') return ['M8_3_1', 'M8_3_2'];
    }
    //------agregar tema aquí---//
    return [];
  }, []);

  const polygons = useMemo(() => {
    return [
      ...data,
      ...planeacionData,
      ...contraloriaData,
      ...capacitacionData,
      ...ingresosData,
      ...egresosData,
      ...disciplinaFinancieraData,
      ...desarrolloUrbanoData,
      ...ordenamientoEcologicoData,
      ...proteccionCivilData,
      ...marcoNormativoData,
      ...diagnosticoData,
      ...accionesData,
      ...EvaluacionData,
      ...coordinacionUrbanaData,
      ...preservacionData,
      ...cambioClimaticoData,
      ...serviciosData,
      ...educacionData,
      ...saludData,
      ...gruposData,
      ...igualdadData,
      ...juventudData,
      ...deporteData,
      ...mejoraData,
      ...vocacionData,
      ...fomentoData,
      ...transparenciaData,
      ...participacionData,
      ...eticaData,
      //------agregar tema aquí---//
      ...patrimonioData
    ]
      .filter(item => item && item.geom && Array.isArray(item.geom.coordinates))
      .map((item, index) =>
        item.geom.coordinates.map((polygon, polygonIndex) => {
          const indicatorKey = `${selectedIndicator}_${selectedYear}`;
          const value = item[indicatorKey];
          if (value !== undefined && value !== null) {
            const color = getColor(value);
            return (
              <Polygon
                key={`${item.id}-${polygonIndex}`}
                positions={polygon[0].map(coord => [coord[1], coord[0]])}
                pathOptions={{
                  color: 'black',
                  fillColor: color,
                  fillOpacity: color === 'rgba(0, 0, 0, 0.0)' ? 0 : 0.8,
                  weight: 1,
                }}
                eventHandlers={{
                  mouseover: (e) => handleMouseOver(e, item, index, polygonIndex),
                  mouseout: handleMouseOut,
                  click: () => handlePolygonClick(item)
                }}
              >
                {zoomLevel >= 10 && (
                  <Tooltip direction="center" permanent>
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: 'rgba(255, 255, 255, 0)',
                      padding: '0px 0px',
                      borderRadius: '4px'
                    }}>
                      {item.NOMGEO}
                    </span>
                  </Tooltip>
                )}
              </Polygon>
            );
          }
          return null;
        })
      );
  }, [
    data,
    planeacionData,
    contraloriaData,
    capacitacionData,
    ingresosData,
    egresosData,
    disciplinaFinancieraData,
    patrimonioData,
    desarrolloUrbanoData,
    proteccionCivilData,
    coordinacionUrbanaData,
    marcoNormativoData,
    diagnosticoData,
    accionesData,
    EvaluacionData,
    preservacionData,
    cambioClimaticoData,
    serviciosData,
    educacionData,
    saludData,
    gruposData,
    igualdadData,
    juventudData,
    deporteData,
    mejoraData,
    vocacionData,
    fomentoData,
    transparenciaData,
    participacionData,
    eticaData,
    //------agregar tema aquí---//
    selectedIndicator,
    selectedYear,
    zoomLevel,
    handleMouseOver,
    handleMouseOut,
    handlePolygonClick
  ]);

  return (
    <div className="map-container">
      <div className="info-box">
        <div className="semaforo" style={{ backgroundColor: getColor(hoveredValue) }}></div>
        <div className="municipio-nombre">
          {hoveredMunicipio}
        </div>
      </div>
      <div className="selector-container">
        <label htmlFor="module-select" className="selector-label">Selecciona un módulo:</label>
        <select id="module-select" value={selectedModule} onChange={handleModuleChange} className="selector-dropdown">
          <option value="M1">Organización</option>
          <option value="M2">Hacienda</option>
          <option value="M3">Gestión del territorio</option>
          <option value="M4">Servicios públicos</option>
          <option value="M5">Medio ambiente</option>
          <option value="M6">Desarrollo social</option>
          <option value="M7">Desarrollo económico</option>
          <option value="M8">Gobierno abierto</option>
        </select>

        <label htmlFor="theme-select" className="selector-label">Selecciona un tema:</label>
        <select id="theme-select" value={selectedTheme} onChange={handleThemeChange} className="selector-dropdown">
          {getThemesForModule(selectedModule).map(theme => (
            <option key={theme} value={theme}>{themeMap[theme]}</option>
          ))}
        </select>

        <label htmlFor="indicator-select" className="selector-label">Selecciona un indicador:</label>
        <select id="indicator-select" value={selectedIndicator} onChange={handleIndicatorChange} className="selector-dropdown">
          {getIndicatorsForTheme(selectedTheme).map(indicator => (
            <option key={indicator} value={indicator}>{indicatorMap[indicator] ? indicatorMap[indicator].nombre : indicator.replace(/_/g, '.')}</option>
          ))}
        </select>

        <label htmlFor="year-select" className="selector-label">Selecciona un año:</label>
        <select id="year-select" value={selectedYear} onChange={handleYearChange} className="selector-dropdown">
          <option value="20">2020</option>
          <option value="21">2021</option>
          <option value="22">2022</option>
          <option value="23">2023</option>
        </select>
      </div>
      <div className="search-container">
        <label htmlFor="municipio-search" className="search-label">Buscar municipio:</label>
        <input
          id="municipio-search"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          list="municipio-options"
        />
        <datalist id="municipio-options">
          {uniqueSortedMunicipios([
            ...data,
            ...planeacionData,
            ...contraloriaData,
            ...capacitacionData,
            ...ingresosData,
            ...egresosData,
            ...disciplinaFinancieraData,
            ...patrimonioData,
            ...desarrolloUrbanoData,
            ...ordenamientoEcologicoData,
            ...proteccionCivilData,
            ...coordinacionUrbanaData,
            ...marcoNormativoData,
            ...diagnosticoData,
            ...accionesData,
            ...EvaluacionData,
            ...preservacionData,
            ...cambioClimaticoData,
            ...serviciosData,
            ...educacionData,
            ...saludData,
            ...gruposData,
            ...igualdadData,
            ...juventudData,
            ...deporteData,
            ...mejoraData,
            ...vocacionData,
            ...fomentoData,
            ...transparenciaData,
            ...participacionData,
            ...eticaData
            //------agregar tema aquí---//
          ]).map((municipio, index) => (
            <option key={`${municipio}-${index}`} value={municipio} />
          ))}
        </datalist>
      </div>

      <MapContainer center={[20.11697, -98.73329]} zoom={8} style={{ height: "100vh", width: "100%" }} zoomControl={false}>
        <CaptureZoomLevel setZoomLevel={setZoomLevel} />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />
        {polygons}
        {selectedFeature && <ZoomToFeature feature={selectedFeature} bringToFront={bringToFront} />}
      </MapContainer>
      <div className="indicator-info-box">
        <h4><strong>Indicador:</strong> {indicatorName}</h4>
        <h4><strong>Año:</strong> 20{selectedYear}</h4>
      </div>
      <Legend />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Estado del Indicador"
        className="modal"
        overlayClassName="overlay"
      >
        <EstadoIndicador
          datos={chartData}
          municipio={selectedFeature ? selectedFeature.NOMGEO : ''}
          nombreIndicador={indicatorName}
          tipoIndicador={indicatorType}
        />

        <button onClick={() => setModalIsOpen(false)} className="close-button">Cerrar</button>
      </Modal>
      <div className="bottom-left">
        <a href="/" className="back-button">Volver</a>
      </div>
    </div>
  );
};

export default Mapa;
