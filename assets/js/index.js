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

  // =============================
  // LOADER
  // =============================
  function showLoader() {
    document.getElementById("mapLoader")?.classList.remove("d-none");
  }

  function hideLoader() {
    document.getElementById("mapLoader")?.classList.add("d-none");
  }

  // =============================
  // VIOLATIONS LAYER
  // =============================
  const violationsLayer = new FeatureLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer/1",
    title: "Violations Counts",
    outFields: ["*"],
    labelsVisible: false,
    popupEnabled: true
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
        color: [180, 180, 180, 0.35],
        outline: { color: [80, 80, 80, 1], width: 2 }
      }
    }
  });

  // =============================
  // MAIN MAP IMAGE LAYER (SHOPS)
  // =============================
  const mainLayer = new MapImageLayer({
    url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_Pop_Blocks_Price_Violations_8432_23022026/MapServer",
    title: "Punjab Survey",
    sublayers: [
      { id: 0, title: "Shops Rate List Status", visible: true, popupEnabled: true },
      { id: 2, title: "Districts", visible: true },
      { id: 3, title: "Tehsils", visible: true }
    ]
  });

  // =============================
  // MAP + VIEW
  // =============================
  const map = new Map({
    basemap: "gray-vector",
    layers: [violationsLayer, mainLayer, districtHighlightLayer]
  });

  const view = new MapView({
    container: "viewDiv",
    map,
    center: [72.7097, 31.1704],
    zoom: 6
  });

  // =============================
  // DEBUG INFO
  // =============================
  view.when(() => {
    violationsLayer.queryFeatureCount().then(c => {
      console.log("Violations Feature Count:", c);
    });
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
        `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2,"0")}-${String(nextDay.getDate()).padStart(2,"0")}`;

      filters.push(
        `survey_date_time >= DATE '${selectedDate}' AND survey_date_time < DATE '${nextDate}'`
      );
    }

    const expr = filters.length ? filters.join(" AND ") : null;

    console.log("Shops Definition Expression:", expr);

    shopsLayer.definitionExpression = expr;

    setTimeout(hideLoader, 700);
  }

  // =============================
  // DISTRICT DROPDOWN LOAD (RESTORED)
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
  // DISTRICT FILTER CHANGE
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

        const districtExpr = `district_id = ${selectedDistrict}`;
        console.log("District Highlight Expression:", districtExpr);

        districtHighlightLayer.definitionExpression = districtExpr;

        fetch(`services/get_district_extent.php?district_id=${selectedDistrict}`)
          .then(res => res.json())
          .then(ext => {

            view.goTo(
              new Extent({
                xmin: +ext.xmin,
                ymin: +ext.ymin,
                xmax: +ext.xmax,
                ymax: +ext.ymax,
                spatialReference: { wkid: 4326 }
              }).expand(1.2)
            ).finally(hideLoader);

          });

      } else {
        districtHighlightLayer.definitionExpression = "1=0";
        view.goTo({ center:[72.7097,31.1704], zoom:12 })
          .finally(hideLoader);
      }
    });

  // =============================
  // DATE BUTTONS (RESTORED)
  // =============================
  document.querySelectorAll(".date-btn").forEach(btn => {
    btn.addEventListener("click", function () {

      document.querySelectorAll(".date-btn")
        .forEach(b => b.classList.remove("active"));

      this.classList.add("active");

      selectedDate = this.dataset.date;

      console.log("Selected Date:", selectedDate);

      applyFilters();
    });
  });

  // =============================
  // AUTO SELECT TODAY
  // =============================
  setTimeout(() => {

    const d = new Date();

    const today =
      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

    const btn = document.querySelector(
      `.date-btn[data-date="${today}"]`
    );

    if (btn) {
      console.log("AUTO SELECT DATE:", today);
      btn.click();
    } else {
      console.log("No button found for:", today);
    }

  }, 500);

});