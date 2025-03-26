// Initialize map
var map = L.map('map').setView([38.3474, -81.6333], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Â© OpenStreetMap contributors'
}).addTo(map);

// Initialize marker
var marker = null;

// Update device location
function updateLocation() {
    fetch('http://23.186.16.107:5000/proxy')
    .then(response => response.json())
    .then(data => {
        console.log("API Response:", data);

        if (data.length > 0) {
            let pos = data[0];
            let lat = pos.latitude;
            let lon = pos.longitude;

            console.log("Updating marker to:", lat, lon);

            if (!marker) {
                // Create marker only once
                marker = L.marker([lat, lon]).addTo(map).bindPopup("Easter Bunny ð°");
            } else {
                // Move marker position dynamically
                marker.setLatLng([lat, lon]);
            }

            // Center map on the updated position
            map.setView([lat, lon], 14);
        } else {
            console.warn("No position data received.");
        }
    })
    .catch(error => console.error("Error fetching location:", error));
}

// Update location every 5 seconds
setInterval(updateLocation, 5000);

updateLocation();
