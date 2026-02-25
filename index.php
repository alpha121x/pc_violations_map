<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Price Control Violation BlockWise</title>

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

        /* FULLSCREEN MAP LOADER */
        .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .loader-spinner {
            width: 80px;
            height: 80px;
            border-width: 8px;
        }
    </style>
</head>

<body>

    <!-- Header -->
    <header class="bg-dark text-white text-center py-3">
        <h4 class="mb-0">Price Control Violation BlockWise</h4>
    </header>

    <!-- Filter Bar (CENTERED) -->
    <div class="container-fluid bg-light py-2 border-bottom">
        <div class="row justify-content-center align-items-center">

            <div class="col-auto">
                <label for="districtFilter" class="fw-bold mb-0">
                    Select District:
                </label>
            </div>

            <div class="col-md-3 col-sm-6">
                <select id="districtFilter" class="form-select">
                    <option value="">Loading districts...</option>
                </select>
            </div>

        </div>
    </div>


    <div class="container-fluid bg-white py-2 border-bottom">
        <div class="text-center fw-bold mb-2" id="provinceName"></div>

        <div id="dateButtons" class="d-flex flex-wrap gap-1">

            <button class="btn btn-outline-success btn-sm date-btn active" data-date="">ALL</button>

            <!-- FEB -->
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-18">18 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-19">19 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-20">20 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-21">21 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-22">22 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-23">23 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-24">24 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-25">25 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-26">26 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-27">27 Feb</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-02-28">28 Feb</button>

            <!-- MARCH -->
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-01">1 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-02">2 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-03">3 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-04">4 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-05">5 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-06">6 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-07">7 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-08">8 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-09">9 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-10">10 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-11">11 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-12">12 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-13">13 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-14">14 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-15">15 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-16">16 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-17">17 Mar</button>
            <button class="btn btn-outline-success btn-sm date-btn" data-date="2026-03-18">18 Mar</button>

        </div>
    </div>


    <!-- Map -->
    <div id="viewDiv"></div>

    <!-- FULLSCREEN LOADER -->
    <div id="mapLoader" class="loader-overlay d-none">
        <div class="spinner-border text-success loader-spinner" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://js.arcgis.com/4.29/"></script>
    <script src="assets/js/index.js"></script>

</body>

<script>

</script>

</html>