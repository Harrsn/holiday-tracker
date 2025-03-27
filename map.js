// Initialize the map
var map = L.map('map').setView([38.3474, -81.6333], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Â© OpenStreetMap contributors'
}).addTo(map);

// Define custom icon
var customIcon = L.icon({
    iconUrl: 'images/easter-bunny.png',  // Replace with actual image file path
    iconSize: [100, 100],           
    iconAnchor: [25, 25],         
    popupAnchor: [0, -25]         
});

// Initialize marker but don't place it statically
var marker = null;

// Restore saved path from localStorage or create a new one
var storedPath = localStorage.getItem("bunnyPath");
var bunnyPath = L.polyline(storedPath ? JSON.parse(storedPath) : [], { color: 'green', weight: 4 }).addTo(map);

// Function to save the path to localStorage
function savePath() {
    localStorage.setItem("bunnyPath", JSON.stringify(bunnyPath.getLatLngs()));
}

// Store last known position
var lastPosition = null;  

// Function to smoothly move the marker
function smoothMoveMarker(marker, newLatLng, duration = 1000) {
    let startLatLng = marker.getLatLng();
    let startTime = performance.now();

    function animate(time) {
        let progress = Math.min((time - startTime) / duration, 1);
        let lat = startLatLng.lat + (newLatLng.lat - startLatLng.lat) * progress;
        let lon = startLatLng.lng + (newLatLng.lng - startLatLng.lng) * progress;
        marker.setLatLng([lat, lon]);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

// API polling interval
var updateInterval = 5000; // Default 5 seconds
var intervalId = setInterval(updateLocation, updateInterval);

// Function to adjust polling rate dynamically
function adjustUpdateRate(isMoving) {
    clearInterval(intervalId);
    updateInterval = isMoving ? 5000 : 15000;  // 5s if moving, 15s if stopped
    intervalId = setInterval(updateLocation, updateInterval);
}

// Function to update device location
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
a
            if (!marker) {
                marker = L.marker([lat, lon], { icon: customIcon })
                    .addTo(map)
                    .bindPopup("<div style='text-align: center; font-weight: bold;'>ð Hoppin' through town, bringing smiles all around! ð¸</div>");
            } else {
                smoothMoveMarker(marker, L.latLng(lat, lon));  // Smooth transition
            }

            // Detect movement
            let isMoving = lastPosition && (lastPosition.lat !== lat || lastPosition.lon !== lon);
            adjustUpdateRate(isMoving); // Adjust polling rate

            if (isMoving) {
                bunnyPath.setStyle({ color: 'green' });
                bunnyPath.addLatLng([lat, lon]);
                savePath();  // Save updated path
            } else {
                bunnyPath.setStyle({ color: 'red' });
            }

            lastPosition = { lat, lon };
            map.setView([lat, lon], 17);
        } else {
            console.warn("No position data received.");
        }
    })
    .catch(error => console.error("Error fetching location:", error));
}

// Function to clear the polyline at midnight
function resetPolylineDaily() {
    let now = new Date();
    let timeUntilMidnight = new Date(now);
    timeUntilMidnight.setHours(24, 0, 0, 0);  
    let msUntilMidnight = timeUntilMidnight - now;

    setTimeout(() => {
        console.log("Resetting polyline for a new day!");
        bunnyPath.setLatLngs([]);  
        localStorage.removeItem("bunnyPath");  // Clear stored path
        resetPolylineDaily();  
    }, msUntilMidnight);
}

// Start the midnight reset function
resetPolylineDaily();

// Button to toggle trail visibility
var trailButton = document.createElement("button");
trailButton.innerText = "Hide Trail";
trailButton.style.position = "absolute";
trailButton.style.top = "10px";
trailButton.style.right = "10px";
trailButton.style.padding = "10px";
trailButton.style.background = "#fff";
trailButton.style.border = "1px solid #ccc";
trailButton.style.cursor = "pointer";
document.body.appendChild(trailButton);

trailButton.addEventListener("click", function() {
    if (map.hasLayer(bunnyPath)) {
        map.removeLayer(bunnyPath);
        this.innerText = "Show Trail";
    } else {
        bunnyPath.addTo(map);
        this.innerText = "Hide Trail";
    }
});

// Update location every 5 seconds
updateLocation();
