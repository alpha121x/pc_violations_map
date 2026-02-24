<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Price Control Violation With Block</title>

<link rel="stylesheet" href="https://js.arcgis.com/4.29/esri/themes/light/main.css">
<script src="https://js.arcgis.com/4.29/"></script>

<style>
    body {
        margin: 0;
        font-family: Arial, sans-serif;
    }

    header {
        background: #1f2937;
        color: white;
        padding: 12px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
    }

    .filter-bar {
        background: #f3f4f6;
        padding: 10px;
        display: flex;
        gap: 10px;
        align-items: center;
    }

    select {
        padding: 6px 10px;
        font-size: 14px;
    }

    #viewDiv {
        width: 100%;
        height: calc(100vh - 110px);
    }
</style>
</head>

<body>

<header>
    Price Control Violation With Block
</header>

<div class="filter-bar">
    <label><b>Select District:</b></label>
    <select id="districtFilter">
        <option value="">All Districts</option>
        <option value="dhaka">Dhaka</option>
        <option value="chittagong">Chittagong</option>
        <option value="rajshahi">Rajshahi</option>
        <option value="khulna">Khulna</option>
    </select>
</div>

<div id="viewDiv"></div>

<script>
require([
    "esri/Map",
    "esri/views/MapView"
], function(Map, MapView) {

    const map = new Map({
        basemap: "streets-navigation-vector"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [90.4125, 23.8103],
        zoom: 7
    });

    // Example district coordinates (replace with real data)
    const districtLocations = {
        dhaka: [90.4125, 23.8103],
        chittagong: [91.7832, 22.3569],
        rajshahi: [88.6042, 24.3745],
        khulna: [89.5403, 22.8456]
    };

    document.getElementById("districtFilter").addEventListener("change", function() {
        const district = this.value;

        if (district && districtLocations[district]) {
            view.goTo({
                center: districtLocations[district],
                zoom: 10
            });
        } else {
            view.goTo({
                center: [90.4125, 23.8103],
                zoom: 7
            });
        }
    });

});
</script>

</body>
</html>
