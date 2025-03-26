import React, { useState, useEffect } from "react";
import { fetchMostAffectedDistricts } from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const crimeColors = {
    "Break In": "#e6194B",
    "Causing Injury": "#3cb44b",
    "Murder": "#808000",
    "Rape": "#4363d8",
    "Robbery Gang Armed": "#f58231",
    "Robbery Gang Unarmed": "#911eb4",
    "Robbery Solo Armed": "#023A00",
    "Robbery Solo Unarmed": "#f032e6",
    "Theft Other": "#469990",
    "Theft Vehicle Lorry": "#9A6324",
    "Theft Vehicle Motorcar": "#800000",
    "Theft Vehicle Motorcycle": "#000075"
};

function MostAffected() {
    const [data, setData] = useState([]);
    const [year, setYear] = useState("2016");
    const [state, setState] = useState("Johor");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const queryParams = new URLSearchParams({ year, state }).toString();
            console.log("Fetching data with query:", queryParams); // Debug log

            const newData = await fetchMostAffectedDistricts(queryParams);
            console.log("Received data:", newData); // Debug log
            
            if (newData) {
                setData(newData);
            }
            setLoading(false);
        };
        fetchData();
    }, [year, state]);

    return (
        <div className="relative">
            <h2 className="text-xl font-bold mb-4">Most Affected Districts in {state}</h2>

            {/* Filter Controls */}
            <div className="flex space-x-4 mb-4">
                <select className="p-2 border rounded-md" value={year} onChange={(e) => setYear(e.target.value)}>
                    {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                    ))}
                </select>

                <select className="p-2 border rounded-md" value={state} onChange={(e) => setState(e.target.value)}>
                    {["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Pulau Pinang", "Perak", "Perlis",
                      "Sabah", "Sarawak", "Selangor", "Terengganu", "W.P. Kuala Lumpur"].map((st) => (
                        <option key={st} value={st}>{st}</option>
                    ))}
                </select>
            </div>

            {/* Chart Display */}
            {loading ? <p>Loading...</p> : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart layout="vertical" data={data} margin={{ left: 50, right: 30 }}>
                        <XAxis type="number" />
                        <YAxis dataKey="district" type="category" width={150} />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: "#f0f0f0",
                                borderRadius: "5px",
                                padding: "10px"
                            }} 
                        />

                        {/* Stack each crime type */}
                        {Object.keys(crimeColors).map((key) =>
                            data.some(d => d[key] > 0) ? (
                                <Bar key={key} dataKey={key} stackId="a" fill={crimeColors[key]} />
                            ) : null
                        )}
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p>No data available for this selection.</p>
            )}
        </div>
    );
}

export default MostAffected;