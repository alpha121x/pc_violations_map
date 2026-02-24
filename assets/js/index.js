require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/widgets/LayerList",
  "esri/geometry/Extent",
], function (
  Map,
  MapView,
  MapImageLayer,
  FeatureLayer,
  Legend,
  Expand,
  LayerList,
  Extent,
) {
  // ======================================
  // MAP IMAGE LAYER (ALL SERVICE LAYERS)
  // ======================================

  const boundaryLayer = new MapImageLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer",
    title: "Layers",

    sublayers: [
      { id: 0, visible: true }, // Districts
      { id: 1, visible: true }, // Surveyed Shops
      { id: 2, visible: false }, // ⭐ VERY IMPORTANT (hide duplicate)
      { id: 3, visible: true },
      { id: 4, visible: true },
    ],
  });

  // ======================================
  // INTERACTIVE FEATURE LAYER (POPUP)
  // ======================================
  const violationsLayer = new FeatureLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer/2",
    outFields: ["*"],
    title: "Violations Counts BlockWise",
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

  // ======================================
  // MAP
  // ======================================
  const map = new Map({
    basemap: "streets-navigation-vector",
    layers: [boundaryLayer, violationsLayer],
  });

  // ======================================
  // MAP VIEW
  // ======================================
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [72.7097, 31.1704],
    zoom: 6,

    popup: {
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: true,
        position: "top-right",
      },
    },
  });

  // ======================================
  // DEBUG CLICK (POPUP TROUBLESHOOT)
  // ======================================
  view.on("click", function (event) {
    console.log("🟢 Map clicked:", event.mapPoint);

    view.hitTest(event).then(function (response) {
      console.log("🔵 HitTest response:", response);

      if (!response.results.length) {
        console.log("❌ No feature detected");
        return;
      }

      response.results.forEach((r, i) => {
        console.log("Result", i);
        console.log("Layer:", r.graphic.layer?.title);
        console.log("Attributes:", r.graphic.attributes);
      });
    });
  });

  // ======================================
  // LEGEND
  // ======================================
  const legend = new Legend({
    view: view,
  });

  const legendExpand = new Expand({
    view: view,
    content: legend,
    expanded: true,
  });

  view.ui.add(legendExpand, "top-right");

  // ======================================
  // LAYER LIST (TOGGLE LAYERS)
  // ======================================
  const layerList = new LayerList({
    view: view,
  });

  const layerExpand = new Expand({
    view: view,
    content: layerList,
    expanded: false,
  });

  view.ui.add(layerExpand, "top-left");

  // ======================================
  // DISTRICT CHANGE → ZOOM + FILTER
  // ======================================
  document
    .getElementById("districtFilter")
    .addEventListener("change", function () {
      const districtId = this.value;

      // reset filter
      if (!districtId) {
        violationsLayer.definitionExpression = null;
        view.goTo({
          center: [72.7097, 31.1704],
          zoom: 6,
        });
        return;
      }

      fetch(`services/get_district_extents.php?district_id=${districtId}`)
        .then((res) => res.json())
        .then((extent) => {
          console.log("Extent:", extent);

          // create REAL ArcGIS extent
          const districtExtent = new Extent({
            xmin: Number(extent.xmin),
            ymin: Number(extent.ymin),
            xmax: Number(extent.xmax),
            ymax: Number(extent.ymax),
            spatialReference: { wkid: 4326 },
          });

          // zoom to district
          view.goTo(districtExtent.expand(1.2));

          // FILTER layer (⚠ change field name if needed)
          violationsLayer.definitionExpression =
            "district_gid = " + Number(districtId);
        });
    });

  // ======================================
  // LOAD DISTRICTS FROM API
  // ======================================
  function loadDistricts() {
    fetch("services/get_districts.php")
      .then((res) => res.json())
      .then((data) => {
        const select = document.getElementById("districtFilter");

        select.innerHTML = `<option value="">All Districts</option>`;

        data.districts.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.gid;
          option.textContent = item.district_name;

          select.appendChild(option);
        });
      })
      .catch((err) => {
        console.error("Error loading districts:", err);
      });
  }

  // load dropdown on start
  loadDistricts();
});
