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
  // WORKING VERSION - USING MAPIMAGELAYER WITH POPUPS
  // ======================================
  
  // Main MapImageLayer with all data
  const mainLayer = new MapImageLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer",
    title: "Punjab Surve",
    
    // Configure all sublayers
    sublayers: [
      { 
        id: 0, 
        title: "District Boundaries", 
        visible: true,
        popupEnabled: false,
        popupTemplate: {
          title: "District: {district_name}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                { fieldName: "district_name", label: "District" },
                { fieldName: "district_id", label: "District ID" }
              ]
            }
          ]
        }
      },
      { 
        id: 1, 
        title: "Surveyed Shops", 
        visible: true,
        popupEnabled: true,
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
                },
                { fieldName: "lng", label: "Longitude" },
                { fieldName: "lat", label: "Latitude" }
              ]
            },
            {
              type: "media",
              mediaInfos: [{
                title: "<b>Shop Image</b>",
                type: "image",
                caption: "{shop_name}",
                value: {
                  sourceURL: "{image}"
                }
              }]
            }
          ]
        }
      },
      { 
        id: 2, 
        title: "Violation Blocks", 
        visible: true,
        popupEnabled: true,
        popupTemplate: {
          title: "Violation Block",
          content: [{ type: "fields", fieldInfos: [{ fieldName: "*" }] }]
        }
      },
      { 
        id: 3, 
        title: "Surveyed Shops", 
        visible: true,
        popupEnabled: true,
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
                caption: "{shop_name}",
                value: {
                  sourceURL: "{image}"
                }
              }]
            }
          ]
        }
      },
      { 
        id: 4, 
        title: "Population Blocks", 
        visible: false,
        popupEnabled: true,
        popupTemplate: {
          title: "Population Block",
          content: [{ type: "fields", fieldInfos: [{ fieldName: "*" }] }]
        }
      }
    ]
  });

  // ======================================
  // MAP
  // ======================================
  const map = new Map({
    basemap: "streets-navigation-vector",
    layers: [mainLayer]
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
        position: "top-right"
      }
    }
  });

  // ======================================
  // DEBUG CLICK - See what's being clicked
  // ======================================
  view.on("click", function(event) {
    view.hitTest(event).then(response => {
      console.log("=== Clicked Features ===");
      console.log("Total features:", response.results.length);
      
      response.results.forEach((result, index) => {
        console.log(`\nFeature ${index + 1}:`);
        console.log("Layer ID:", result.graphic.layer?.id);
        console.log("Layer Title:", result.graphic.layer?.title);
        console.log("Geometry:", result.graphic.geometry?.type);
        
        if (result.graphic.attributes) {
          console.log("Attributes:", result.graphic.attributes);
          
          // Check specifically for shop data
          if (result.graphic.attributes.shop_name) {
            console.log("✓ SHOP DATA FOUND in layer", result.graphic.layer?.id);
            console.log("Shop Name:", result.graphic.attributes.shop_name);
            console.log("Image URL:", result.graphic.attributes.image);
          }
        }
      });
    });
  });

  // ======================================
  // WIDGETS
  // ======================================
  
  // Legend
  const legend = new Legend({ 
    view: view,
    layerInfos: [{
      layer: mainLayer,
      title: "Punjab Survey Data"
    }]
  });
  
  const legendExpand = new Expand({
    view: view,
    content: legend,
    expanded: true
  });
  view.ui.add(legendExpand, "top-right");

  // Layer List
  const layerList = new LayerList({ view: view });
  const layerExpand = new Expand({
    view: view,
    content: layerList,
    expanded: false
  });
  view.ui.add(layerExpand, "top-left");

  // ======================================
  // DISTRICT FILTER
  // ======================================
  document
    .getElementById("districtFilter")
    .addEventListener("change", function() {
      const districtId = this.value;
      
      // Apply filter to shop layers (IDs 1 and 3)
      const shopLayer1 = mainLayer.sublayers.find(s => s.id === 1);
      const shopLayer3 = mainLayer.sublayers.find(s => s.id === 3);
      
      if (districtId) {
        // Filter both shop layers
        if (shopLayer1) shopLayer1.definitionExpression = `district_id = ${districtId}`;
        if (shopLayer3) shopLayer3.definitionExpression = `district_id = ${districtId}`;
        
        // Zoom to district
        fetch(`services/get_district_extent.php?district_id=${districtId}`)
          .then(res => res.json())
          .then(extent => {
            if (extent) {
              view.goTo({
                target: new Extent({
                  xmin: Number(extent.xmin),
                  ymin: Number(extent.ymin),
                  xmax: Number(extent.xmax),
                  ymax: Number(extent.ymax),
                  spatialReference: { wkid: 4326 }
                }).expand(1.2)
              });
            }
          })
          .catch(() => console.log("Extent fetch failed"));
      } else {
        // Clear filters
        if (shopLayer1) shopLayer1.definitionExpression = null;
        if (shopLayer3) shopLayer3.definitionExpression = null;
        
        // Zoom to full extent
        view.goTo({ center: [72.7097, 31.1704], zoom: 6 });
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
    })
    .catch(err => console.error("Error loading districts:", err));

  // ======================================
  // SHOP COUNT
  // ======================================
  view.when(() => {
    // Wait for layers to load
    setTimeout(() => {
      const shopLayer3 = mainLayer.sublayers.find(s => s.id === 3);
      if (shopLayer3) {
        // Create count display
        const countDiv = document.createElement("div");
        countDiv.style = "background: white; padding: 10px; border-radius: 5px; margin: 10px; font-family: Arial; border-left: 4px solid #0079c1;";
        countDiv.id = "shopCount";
        countDiv.innerHTML = "<b>Loading shop count...</b>";
        view.ui.add(countDiv, "bottom-left");
        
        // Try to get count (this might not work with MapImageLayer sublayers)
        console.log("Shop layer 3 configured with popup template");
      }
    }, 2000);
  });

  // ======================================
  // SERVICE INFO
  // ======================================
  fetch("https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer?f=json")
    .then(res => res.json())
    .then(data => {
      console.log("=== SERVICE LAYERS ===");
      data.layers.forEach(layer => {
        console.log(`Layer ${layer.id}: ${layer.name}`);
      });
    });

});