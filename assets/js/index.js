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
  Extent
) {

  let selectedDate = "";
  let selectedDistrict = "";

  function showLoader() {
    document.getElementById("mapLoader")?.classList.remove("d-none");
  }

  function hideLoader() {
    document.getElementById("mapLoader")?.classList.add("d-none");
  }

  // =============================
  // VIOLATIONS LAYER (POLYGONS)
  // =============================
  const violationsLayer = new FeatureLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer/1",
    title: "Violations Counts",
    outFields: ["*"],
    labelsVisible: false,
    popupEnabled: true,
    popupTemplate: {
      title: "Block: {block_code}",
      content: [{
        type: "fields",
        fieldInfos: [
          { fieldName: "block_code", label: "Block Code" },
          { fieldName: "violation_count", label: "Violation Count" }
        ]
      }]
    }
  });

  // =============================
  // DISTRICT HIGHLIGHT
  // =============================
  const districtHighlightLayer = new FeatureLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer/2",
    title: "District Highlight",
    popupEnabled: false,
    definitionExpression: "1=0",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [180,180,180,0.35],
        outline: { color:[80,80,80,1], width:2 }
      }
    }
  });

  // =============================
  // MAIN MAP IMAGE LAYER (POINTS)
  // =============================
  const mainLayer = new MapImageLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer",
    title: "Punjab Survey",
    sublayers: [
      { id:0, title:"Shops Rate List Status", visible:true, popupEnabled:true },
      { id:2, title:"Districts", visible:false },
      { id:3, title:"Tehsils", visible:false }
    ]
  });

  // =============================
  // MAP + VIEW
  // =============================
  const map = new Map({
    basemap: "gray-vector",
    layers: [
      violationsLayer,       // BACK
      mainLayer,             // POINTS ABOVE
      districtHighlightLayer // TOP
    ]
  });

  const view = new MapView({
    container: "viewDiv",
    map,
    center: [72.7097, 31.1704],
    zoom: 6
  });

  // =============================
  // POPUP PRIORITY FIX ⭐
  // =============================
  view.popup.autoOpenEnabled = false;

  view.on("click", async (event) => {

    const hit = await view.hitTest(event);
    if (!hit.results.length) return;

    // FIRST → shop points
    const shopHit = hit.results.find(r =>
      r.graphic?.layer?.title === "Shops Rate List Status"
    );

    if (shopHit) {
      view.popup.open({
        features: [shopHit.graphic],
        location: event.mapPoint
      });
      return;
    }

    // SECOND → violations polygons
    const violationHit = hit.results.find(r =>
      r.graphic?.layer === violationsLayer
    );

    if (violationHit) {
      view.popup.open({
        features: [violationHit.graphic],
        location: event.mapPoint
      });
    }
  });

  // =============================
  // DEBUG
  // =============================
  view.when(() => {
    violationsLayer.queryFeatureCount()
      .then(c => console.log("Violations Feature Count:", c));
  });

  // =============================
  // LEGEND + LAYER LIST
  // =============================
  view.ui.add(
    new Expand({
      view,
      content: new Legend({ view }),
      expanded: true
    }),
    "top-right"
  );

  view.ui.add(
    new Expand({
      view,
      content: new LayerList({ view }),
      expanded: false
    }),
    "top-left"
  );

  // =============================
  // APPLY FILTERS
  // =============================
  function applyFilters() {

    showLoader();

    const shopsLayer = mainLayer.sublayers.find(s => s.id === 0);

    let filters = [];

    if (selectedDistrict) {
      filters.push(`district_id = ${selectedDistrict}`);
    }

    if (selectedDate) {

      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const nextDate =
        `${nextDay.getFullYear()}-${String(nextDay.getMonth()+1).padStart(2,"0")}-${String(nextDay.getDate()).padStart(2,"0")}`;

      filters.push(
        `survey_date_time >= DATE '${selectedDate}' AND survey_date_time < DATE '${nextDate}'`
      );
    }

    const expr = filters.length ? filters.join(" AND ") : null;
    console.log("Shops Definition Expression:", expr);

    shopsLayer.definitionExpression = expr;

    setTimeout(hideLoader,700);
  }

  // =============================
  // DISTRICT DROPDOWN LOAD
  // =============================
  fetch("services/get_districts.php")
    .then(res => res.json())
    .then(data => {

      const select = document.getElementById("districtFilter");
      select.innerHTML = `<option value="">All Districts</option>`;

      data.districts.forEach(item => {
        const op = document.createElement("option");
        op.value = item.district_id;
        op.textContent = item.district_name;
        op.dataset.name = item.district_name;
        select.appendChild(op);
      });

      document.getElementById("provinceName").textContent = "PUNJAB";
    });

  // =============================
  // DISTRICT CHANGE
  // =============================
  document.getElementById("districtFilter")
    .addEventListener("change", function () {

      showLoader();
      selectedDistrict = this.value;

      const opt = this.options[this.selectedIndex];
      document.getElementById("provinceName").textContent =
        selectedDistrict ? opt.dataset.name : "PUNJAB";

      applyFilters();

      if (selectedDistrict) {

        districtHighlightLayer.definitionExpression =
          `district_id = ${selectedDistrict}`;

        fetch(`services/get_district_extent.php?district_id=${selectedDistrict}`)
          .then(res => res.json())
          .then(ext => {

            view.goTo(
              new Extent({
                xmin:+ext.xmin,
                ymin:+ext.ymin,
                xmax:+ext.xmax,
                ymax:+ext.ymax,
                spatialReference:{wkid:4326}
              }).expand(1.2)
            ).finally(hideLoader);

          });

      } else {
        districtHighlightLayer.definitionExpression = "1=0";
        view.goTo({center:[72.7097,31.1704],zoom:6})
          .finally(hideLoader);
      }
    });

});