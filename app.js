let map;
let directionsService;
let directionsRenderer;

function initMap() {
    // Create a map centered at a default location (e.g., San Francisco)
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 },  // San Francisco
        zoom: 12,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
    });
}

// Plan route from start to end
function planRoute() {
    const start = document.getElementById("startLocation").value;
    const end = document.getElementById("endLocation").value;
    const batteryLevel = document.getElementById("batteryLevel").value;
    const vehicleRange = document.getElementById("vehicleRange").value;

    if (!start || !end) {
        alert("Please enter both start and end locations.");
        return;
    }

    // Directions request
    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            displayRouteDetails(result);
            fetchChargingStations(start, end);
        } else {
            alert("Directions request failed due to " + status);
        }
    });
}

// Display route details like steps for the journey
function displayRouteDetails(result) {
    const route = result.routes[0];
    const detailsContainer = document.getElementById("routeDetails");
    detailsContainer.innerHTML = `<h2>Route Details</h2><ul>`;
    route.legs[0].steps.forEach((step) => {
        detailsContainer.innerHTML += `<li>${step.instructions}</li>`;
    });
    detailsContainer.innerHTML += `</ul>`;
}

// Fetch charging stations along the route
function fetchChargingStations(start, end) {
    // Example API call to Open Charge Map to fetch nearby charging stations
    const url = `https://api.openchargemap.io/v3/poi/?output=json&maxresults=5&latitude=37.7749&longitude=-122.4194`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            data.forEach((station) => {
                const latLng = new google.maps.LatLng(station.AddressInfo.Latitude, station.AddressInfo.Longitude);
                const marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: station.AddressInfo.Title,
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<h4>${station.AddressInfo.Title}</h4>
                              <p>${station.AddressInfo.AddressLine1}</p>
                              <p>Available: ${station.StatusType.Description}</p>
                              <p>Connector Types: ${station.Connections.map(conn => conn.ConnectionType.Title).join(", ")}</p>`,
                });

                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching charging stations:", error);
        });
}
