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

  document
    .getElementById("districtFilter")
    .addEventListener("change", function () {
      const districtId = this.value;

      if (!districtId) return;

      fetch(`services/get_district_extents.php?district_id=${districtId}`)
        .then((res) => res.json())
        .then((extent) => {
          view.goTo({
            target: {
              xmin: parseFloat(extent.xmin),
              ymin: parseFloat(extent.ymin),
              xmax: parseFloat(extent.xmax),
              ymax: parseFloat(extent.ymax),
              spatialReference: { wkid: 4326 },
            },
          });

          // FILTER violations layer by district
          violationsLayer.definitionExpression = "district_gid = " + districtId;
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

        // reset dropdown
        select.innerHTML = `<option value="">All Districts</option>`;

        // LOOP districts array
        data.districts.forEach((item) => {
          const option = document.createElement("option");

          // value = gid (BEST PRACTICE)
          option.value = item.gid;

          // text shown
          option.textContent = item.district_name;

          select.appendChild(option);
        });
      })
      .catch((err) => {
        console.error("Error loading districts:", err);
      });
  }

  // call on page load
  loadDistricts();
});
