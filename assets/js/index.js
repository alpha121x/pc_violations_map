require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand"
], function(Map, MapView, MapImageLayer, Legend, Expand) {

    // ArcGIS Service Layer
    const violationLayer = new MapImageLayer({
        url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer"
    });

    // Map
    const map = new Map({
        basemap: "streets-navigation-vector",
        layers: [violationLayer]
    });

    // Map View
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [72.7097, 31.1704],
        zoom: 6
    });

    // =========================
    // ⭐ LEGEND
    // =========================
    const legend = new Legend({
        view: view,
        layerInfos: [{
            layer: violationLayer,
            title: "Price Control Violations BlockWise"
        }]
    });

    // Expand button (clean UI)
    const legendExpand = new Expand({
        view: view,
        content: legend,
        expanded: true
    });

    // Add legend to map
    view.ui.add(legendExpand, "top-right");

    // District coordinates
    const districtLocations = {
        lahore: [74.3587, 31.5204],
        faisalabad: [73.0845, 31.4504],
        multan: [71.5249, 30.1575],
        rawalpindi: [73.0479, 33.6844],
        gujranwala: [74.1871, 32.1617]
    };

    // District filter
    document.getElementById("districtFilter").addEventListener("change", function() {
        const district = this.value;

        if (district && districtLocations[district]) {
            view.goTo({
                center: districtLocations[district],
                zoom: 10
            });
        } else {
            view.goTo({
                center: [72.7097, 31.1704],
                zoom: 7
            });
        }
    });

});