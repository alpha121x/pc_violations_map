require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/widgets/LayerList",
  "esri/geometry/Extent"
], function (
  Map,
  MapView,
  MapImageLayer,
  FeatureLayer,
  Legend,
  Expand,
  LayerList,
  Extent
) {

  // ======================================
  // DISTRICT HIGHLIGHT LAYER
  // ======================================
  const districtHighlightLayer = new FeatureLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer/0",
    title: "District Highlight",
    popupEnabled: false,
    definitionExpression: "1=0",

    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [180, 180, 180, 0.35],
        outline: {
          color: [80, 80, 80, 1],
          width: 2
        }
      }
    }
  });

  // ======================================
  // MAIN MAP IMAGE LAYER
  // ======================================
  const mainLayer = new MapImageLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer",
    title: "Punjab Survey",

    sublayers: [

      {
        id: 0,
        title: "District Boundaries",
        visible: true,
        popupEnabled: false,
        labelsVisible: false
      },

      {
        id: 1,
        title: "Surveyed Shops",
        visible: true,
        popupEnabled: true,
        labelsVisible: false,
        popupTemplate: {
          title: "{shop_name}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "shop_name", label: "Shop Name" },
                { fieldName: "shop_owner_name", label: "Owner" },
                { fieldName: "district_name", label: "District" },
                { fieldName: "tehsil_name", label: "Tehsil" },
                { fieldName: "city_name", label: "City" },
                { fieldName: "commodity_violation_status", label: "Violation Status" },
                { fieldName: "commodity_violation_list", label: "Violations" },
                { fieldName: "rate_list_displayed", label: "Rate List Displayed" },
                {
                  fieldName: "survey_date_time",
                  label: "Survey Date",
                  format: { dateFormat: "short-date-short-time" }
                }
              ]
            },
            {
              type: "media",
              mediaInfos: [{
                title: "Shop Image",
                type: "image",
                value: { sourceURL: "{image}" }
              }]
            }
          ]
        }
      },

      {
        id: 2,
        title: "Violation Blocks",
        visible: true,
        popupEnabled: false,
        labelsVisible: false
      },

      {
        id: 3,
        title: "Surveyed Shops",
        visible: true,
        popupEnabled: true,
        labelsVisible: false,
        popupTemplate: {
          title: "{shop_name}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "shop_name", label: "Shop Name" },
                { fieldName: "shop_owner_name", label: "Owner" },
                { fieldName: "district_name", label: "District" },
                { fieldName: "tehsil_name", label: "Tehsil" },
                { fieldName: "city_name", label: "City" },
                { fieldName: "commodity_violation_status", label: "Violation Status" },
                { fieldName: "commodity_violation_list", label: "Violations" },
                { fieldName: "rate_list_displayed", label: "Rate List Displayed" },
                { fieldName: "survey_date_time", label: "Survey Date" },
                { fieldName: "image", label: "Image URL" }
              ]
            },
            {
              type: "media",
              mediaInfos: [{
                title: "Shop Image",
                type: "image",
                value: { sourceURL: "{image}" }
              }]
            }
          ]
        }
      },

      {
        id: 4,
        title: "Population Blocks",
        visible: false,
        popupEnabled: false,
        labelsVisible: false
      }
    ]
  });

  // ======================================
  // MAP
  // ======================================
  const map = new Map({
    basemap: "streets-navigation-vector",
    layers: [mainLayer, districtHighlightLayer]
  });

  // ======================================
  // MAP VIEW
  // ======================================
  const view = new MapView({
    container: "viewDiv",
    map,
    center: [72.7097, 31.1704],
    zoom: 6,
    popup: {
      dockEnabled: true,
      dockOptions: { position: "top-right" }
    }
  });

  // remove labels safety
  mainLayer.when(() => {
    mainLayer.sublayers.forEach(s => s.labelsVisible = false);
  });

  // ======================================
  // WIDGETS
  // ======================================
  view.ui.add(new Expand({
    view,
    content: new Legend({ view }),
    expanded: true
  }), "top-right");

  view.ui.add(new Expand({
    view,
    content: new LayerList({ view }),
    expanded: false
  }), "top-left");

  // ======================================
  // DISTRICT FILTER
  // ======================================
  document.getElementById("districtFilter")
    .addEventListener("change", function () {

      const districtId = this.value;

      const shopLayer1 = mainLayer.sublayers.find(s => s.id === 1);
      const shopLayer3 = mainLayer.sublayers.find(s => s.id === 3);

      if (districtId) {

        if (shopLayer1)
          shopLayer1.definitionExpression = `district_id = ${districtId}`;

        if (shopLayer3)
          shopLayer3.definitionExpression = `district_id = ${districtId}`;

        // highlight district
        districtHighlightLayer.definitionExpression =
          `district_id = ${districtId}`;

        fetch(`services/get_district_extent.php?district_id=${districtId}`)
          .then(res => res.json())
          .then(extent => {

            view.goTo(new Extent({
              xmin: Number(extent.xmin),
              ymin: Number(extent.ymin),
              xmax: Number(extent.xmax),
              ymax: Number(extent.ymax),
              spatialReference: { wkid: 4326 }
            }).expand(1.2));

          });

      } else {

        if (shopLayer1) shopLayer1.definitionExpression = null;
        if (shopLayer3) shopLayer3.definitionExpression = null;

        districtHighlightLayer.definitionExpression = "1=0";

        view.goTo({
          center: [72.7097, 31.1704],
          zoom: 6
        });
      }
    });

  // ======================================
  // LOAD DISTRICTS
  // ======================================
  fetch("services/get_districts.php")
    .then(res => res.json())
    .then(data => {

      const select = document.getElementById("districtFilter");
      select.innerHTML = '<option value="">All Districts</option>';

      data.districts.forEach(item => {
        const option = document.createElement("option");
        option.value = item.district_id;
        option.textContent = item.district_name;
        select.appendChild(option);
      });

    });

});