import React, { useEffect, useState } from "react";
import { fetchCrimeType } from "../api"; // Make sure this points to the correct api.js file
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#A28BFF", "#FF6384", "#36A2EB"];

function CrimeDistribution() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);  // Loading state
    const [error, setError] = useState(""); // Error state
    const [year, setYear] = useState("2016"); // Year filter state
    const [state, setState] = useState("Selangor"); // State filter state

    // Fetch crime data with optional year and state filter
    const fetchCrimeData = () => {
        setLoading(true); // Set loading state before fetching data
        let queryParams = new URLSearchParams();
        if (year) queryParams.append("year", year);  // Add year filter if selected
        if (state) queryParams.append("state", state); // Add state filter if selected
        
        fetchCrimeType(queryParams.toString()) // Pass query params to fetch data
            .then(response => {
                if (response) {
                    const cleanedData = response.filter(item => item.type !== "All").map(item => ({
                        ...item,
                        year: new Date(item.date).getFullYear().toString(),
                    }));
                    setData(cleanedData);  // Set all data
                } else {
                    setData([]);
                }
                setLoading(false); // Set loading to false after fetching data
            })
            .catch(error => {
                console.error("Failed to fetch crime data:", error);
                setError("Failed to load data"); // Set error message
                setLoading(false); // Set loading to false even in case of error
            });
    };

    // Fetch data when the component mounts or when year or state filter changes
    useEffect(() => {
        fetchCrimeData();
    }, [year, state]); // Re-fetch data when year or state changes

    // Aggregate crime data for PieChart
    const crimeData = data.reduce((acc, crime) => {
        const existing = acc.find(item => item.name === crime.type);
        if (existing) {
            existing.value += isNaN(crime.crimes) ? 0 : crime.crimes;
        } else {
            acc.push({ name: crime.type, value: isNaN(crime.crimes) ? 0 : crime.crimes });
        }
        return acc;
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold">Crime Breakdown by Type</h2>

            {/* Year Dropdown */}
            <div className="flex mb-4">
                <select
                    className="p-2 border rounded-md mr-4"
                    value={year}
                    onChange={(e) => setYear(e.target.value)} // Set year filter
                >
                    <option value="2016">2016</option>
                    <option value="2017">2017</option>
                    <option value="2018">2018</option>
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                </select>

                {/* State Dropdown */}
                <select
                    className="p-2 border rounded-md"
                    value={state}
                    onChange={(e) => setState(e.target.value)} // Set state filter
                >
                    <option value="Selangor">Selangor</option>
                    <option value="W.P. Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Pulau Pinang">Penang</option>
                    <option value="Johor">Johor</option>
                    <option value="Melaka">Melaka</option>
                    <option value="Sabah">Sabah</option>
                    <option value="Sarawak">Sarawak</option>
                    <option value="Perak">Perak</option>
                    <option value="Terengganu">Terengganu</option>
                    <option value="Kedah">Kedah</option>
                    <option value="Kelantan">Kelantan</option>
                    <option value="Negeri Sembilan">Negeri Sembilan</option>
                    <option value="Pahang">Pahang</option>
                    <option value="Perlis">Perlis</option>
                </select>
            </div>

            {/* Display Loading */}
            {loading && <p className="text-center text-gray-500">Loading...</p>}

            {/* Display Error */}
            {error && <p className="text-center text-red-500">{error}</p>}

            {/* Crime Pie Chart */}
            {crimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                    <Pie
                        data={crimeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                    >
                        {crimeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>

                        <Tooltip />
                        {/* Legend Section */}
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ paddingLeft: "10px" }}
                            content={({ payload }) => (
                                <div>
                                    {payload.map((entry, index) => (
                                        <div key={`legend-${index}`} style={{ display: "flex", alignItems: "center" }}>
                                            <div
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    backgroundColor: entry.color,
                                                    marginRight: "5px",
                                                }}
                                            />
                                            <span>{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-center text-gray-500">No data available</p>
            )}
        </div>
    );
}

export default CrimeDistribution;
