<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Price Control Violation With Block</title>

<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Esri -->
<link rel="stylesheet" href="https://js.arcgis.com/4.29/esri/themes/light/main.css">
<script src="https://js.arcgis.com/4.29/"></script>

<style>
    body {
        margin: 0;
    }

    #viewDiv {
        width: 100%;
        height: calc(100vh - 120px);
    }
</style>
</head>

<body>

<!-- Header -->
<header class="bg-dark text-white text-center py-3">
    <h4 class="mb-0">Price Control Violation With Block</h4>
</header>

<!-- Filter Bar -->
<div class="container-fluid bg-light py-2 border-bottom">
    <div class="row align-items-center">
        <div class="col-auto">
            <label for="districtFilter" class="fw-bold mb-0">Select District:</label>
        </div>
        <div class="col-md-3 col-sm-6">
            <select id="districtFilter" class="form-select">
                <option value="">All Districts</option>
                <option value="lahore">Lahore</option>
                <option value="faisalabad">Faisalabad</option>
                <option value="multan">Multan</option>
                <option value="rawalpindi">Rawalpindi</option>
                <option value="gujranwala">Gujranwala</option>
            </select>
        </div>
    </div>
</div>

<!-- Map -->
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
        center: [72.7097, 31.1704], // Punjab Pakistan
        zoom: 7
    });

    const districtLocations = {
        lahore: [74.3587, 31.5204],
        faisalabad: [73.0845, 31.4504],
        multan: [71.5249, 30.1575],
        rawalpindi: [73.0479, 33.6844],
        gujranwala: [74.1871, 32.1617]
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
                center: [72.7097, 31.1704],
                zoom: 7
            });
        }
    });

});
</script>

</body>
</html>
