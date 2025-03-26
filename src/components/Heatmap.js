import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchCrimeHeatmap } from "../api";
import Legend from "./Legend";

function getCrimeColor(crimeCount) {
    return crimeCount > 500 ? "#FF0000" :  // Red (High)
           crimeCount > 250 ? "#FF4500" :  // Orange-Red
           crimeCount > 100 ? "#FF8C00" :  // Dark Orange
           crimeCount > 50  ? "#FFD700" :  // Yellow (Medium)
           crimeCount > 10  ? "#1E90FF" :  // Dodger Blue (Low)
                              "#0000FF";   // Blue (Lowest)
}

function Heatmap() {
    const [geoData, setGeoData] = useState(null);
    const [year, setYear] = useState("2016"); 
    const [crimeType, setCrimeType] = useState("Causing Injury"); 
    const [geoKey, setGeoKey] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch data on mount and whenever filters change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const queryParams = new URLSearchParams({ year, type: crimeType }).toString();
            console.log("Fetching data with query:", queryParams); // Debug log
            
            const newData = await fetchCrimeHeatmap(queryParams);
            console.log("Received data:", newData); // Debug log
            
            if (newData) {
                setGeoData(newData);
                setGeoKey((prevKey) => prevKey + 1); // Change key to force re-render
            }
            setLoading(false);
        };

        fetchData();
    }, [year, crimeType]);

    return (
            <div className="relative">
                <h2 className="text-xl font-bold mb-4">Crime Heatmap of Malaysia</h2>
    
                {/* Filter Controls */}
                <div className="flex space-x-4 mb-4">
                    {/* Year Dropdown */}
                    <select 
                        className="p-2 border rounded-md"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
    
                    {/* Crime Type Dropdown */}
                    <select 
                        className="p-2 border rounded-md"
                        value={crimeType}
                        onChange={(e) => setCrimeType(e.target.value)}
                    >
                        {[
                            "Causing Injury", "Murder", "Rape", "Robbery Gang Armed",
                            "Robbery Gang Unarmed", "Robbery Solo Armed", "Robbery Solo Unarmed",
                            "Break In", "Theft Other", "Theft Vehicle Lorry", 
                            "Theft Vehicle Motorcar", "Theft Vehicle Motorcycle"
                        ].map(crime => (
                            <option key={crime} value={crime}>{crime}</option>
                        ))}
                    </select>
                </div>
    
                {loading ? (
                    <p className="text-center text-gray-500 py-20">Loading heatmap...</p>
                ) :geoData ? (
                    <div className="relative">
                        <MapContainer center={[4.2105, 106.9758]} zoom={6} style={{ height: "500px", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <GeoJSON
                                key={geoKey}
                                data={geoData}
                                style={(feature) => ({
                                    fillColor: getCrimeColor(feature.properties.crimes),
                                    weight: 2,
                                    opacity: 1,
                                    color: "white",
                                    fillOpacity: 0.7
                                })}
                                onEachFeature={(feature, layer) => {
                                    layer.bindPopup(`<b>${feature.properties.name}</b><br>Crimes: ${feature.properties.crimes}`);
                                }}
                            />
                        </MapContainer>
                        <Legend />
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No data available for the selected filters.</p>            )}
            </div>
        );
}

export default Heatmap;
