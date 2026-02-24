require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/widgets/LayerList",
], function (
  Map,
  MapView,
  MapImageLayer,
  FeatureLayer,
  Legend,
  Expand,
  LayerList,
) {
  // ===============================
  // MAIN MAP IMAGE LAYER (ALL LAYERS)
  // ===============================
  const boundaryLayer = new MapImageLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer",
    title: "Layers",
  });

  // ===============================
  // FEATURE LAYER (POPUP ENABLED)
  // Layer 2 = Violations Blocks
  // ===============================
  const violationsLayer = new FeatureLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer/2",
    outFields: ["*"],
    title: "Violations Blocks",
    popupEnabled: true,

    popupTemplate: {
      title: "Price Control Violation",
      content: [
        {
          type: "fields",
          fieldInfos: [{ fieldName: "*", visible: true }],
        },
      ],
    },
  });

  // ===============================
  // MAP
  // ===============================
  const map = new Map({
    basemap: "streets-navigation-vector",
    layers: [boundaryLayer, violationsLayer],
  });

  // ===============================
  // MAP VIEW
  // ===============================
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [72.7097, 31.1704],
    zoom: 6,

    popup: {
      dockEnabled: true, // looks like internal modal
      dockOptions: {
        buttonEnabled: true,
        position: "top-right",
      },
    },
  });

  // ===============================
  // LEGEND
  // ===============================
  const legend = new Legend({
    view: view,
  });

  const legendExpand = new Expand({
    view: view,
    content: legend,
    expanded: true,
  });

  view.ui.add(legendExpand, "top-right");

  // ===============================
  // CLICKABLE LAYER LIST
  // ===============================
  const layerList = new LayerList({
    view: view,
  });

  const layerExpand = new Expand({
    view: view,
    content: layerList,
    expanded: false,
  });

  view.ui.add(layerExpand, "top-left");

  // ===============================
  // DISTRICT FILTER (ZOOM)
  // ===============================
  const districtLocations = {
    lahore: [74.3587, 31.5204],
    faisalabad: [73.0845, 31.4504],
    multan: [71.5249, 30.1575],
    rawalpindi: [73.0479, 33.6844],
    gujranwala: [74.1871, 32.1617],
  };

  document
    .getElementById("districtFilter")
    .addEventListener("change", function () {
      const district = this.value;

      if (district && districtLocations[district]) {
        view.goTo({
          center: districtLocations[district],
          zoom: 10,
        });
      } else {
        view.goTo({
          center: [72.7097, 31.1704],
          zoom: 7,
        });
      }
    });
});
