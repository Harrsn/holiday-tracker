<script src="https://unpkg.com/leaflet/dist/leaflet.min.js"></script>

<script>
    // Initialize the map
    var map = L.map('map').setView([38.3474, -81.6333], 17); // Initial position for South Charleston
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Define custom icon for the Easter Bunny
    var customIcon = L.icon({
        iconUrl: 'images/easter-bunny.png', // Ensure path to image is correct
        iconSize: [50, 50],  // Adjust size for visibility
        iconAnchor: [25, 50], // Center the icon correctly
        popupAnchor: [0, -50] // Adjust popup position
    });

    var marker = null; // Marker initialization
    var bunnyPath = L.polyline([], { color: 'green', weight: 4 }).addTo(map); // Path for bunny trail

    // API polling interval setup
    var updateInterval = 5000; // Update every 5 seconds
    var intervalId = setInterval(updateLocation, updateInterval);

    // Function to update bunny's location
    function updateLocation() {
        fetch('/proxy')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    var pos = data[0];
                    var lat = pos.latitude;
                    var lon = pos.longitude;

                    // If marker isn't set, initialize it
                    if (!marker) {
                        marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
                    } else {
                        // Move marker smoothly
                        smoothMoveMarker(marker, L.latLng(lat, lon));
                    }

                    // Update path (trail)
                    bunnyPath.addLatLng([lat, lon]);
                    map.setView([lat, lon], 17); // Move map to new position
                } else {
                    console.error("No position data received.");
                }
            })
            .catch(error => console.error("Error fetching location:", error));
    }

    // Function to smoothly move the marker
    function smoothMoveMarker(marker, newLatLng, duration = 1000) {
        var startLatLng = marker.getLatLng();
        var startTime = performance.now();

        function animate(time) {
            var progress = Math.min((time - startTime) / duration, 1);
            var lat = startLatLng.lat + (newLatLng.lat - startLatLng.lat) * progress;
            var lon = startLatLng.lng + (newLatLng.lng - startLatLng.lng) * progress;
            marker.setLatLng([lat, lon]);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }
</script>
