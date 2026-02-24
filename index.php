<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Price Control Violation With Block</title>

    <link rel="icon" href="public/gop_favicon.png" type="image/x-icon">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Esri -->
    <link rel="stylesheet" href="https://js.arcgis.com/4.29/esri/themes/light/main.css">
    

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

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://js.arcgis.com/4.29/"></script>
    <script src="assets/js/index.js"></script>

</body>

</html>