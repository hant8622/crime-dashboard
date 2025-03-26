import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, LabelList } from "recharts";

function CrimeRateChange() {
    const [data, setData] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("Johor");
    const [loading, setLoading] = useState(false);

    // Fetch filters (states)
    useEffect(() => {
        fetch("http://127.0.0.1:5050/api/filters")
            .then((res) => res.json())
            .then(({ states }) => {
                const cleanedStates = [...new Set(states.filter(Boolean))];
                setStates(cleanedStates);
            })
            .catch(err => console.error("Failed to fetch states:", err));
    }, []);

    // Fetch % change data when selectedState changes
    useEffect(() => {
        async function fetchCrimeRateData() {
            setLoading(true);
            try {
                const res = await fetch(`http://127.0.0.1:5050/crime-rate-change?state=${encodeURIComponent(selectedState)}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Error fetching crime rate change:", err);
                setData([]);
            }
            setLoading(false);
        }

        if (selectedState) fetchCrimeRateData();
    }, [selectedState]);

    const getLabelPosition = (value) => (value >= 0 ? "top" : "bottom");

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Crime Rate % Change (YoY)</h2>

            {/* Dropdown for State Filter */}
            <div className="mb-6">
                <select
                    className="p-2 border border-gray-300 rounded-md text-sm"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                >
                    {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>

            {/* Bar Chart */}
            <div className="bg-white border rounded-xl shadow p-4 mt-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading chart...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data}>
                            <XAxis dataKey="year" />
                            <YAxis unit="%" />
                            <Tooltip 
                                formatter={(value) => [`Crime Rate % Change (YoY): ${value}%`]} 
                            />
                            
                            {/* Custom Legend with Black Text & Colored Squares */}
                            <Legend 
                                verticalAlign="top" 
                                align="right" 
                                wrapperStyle={{ paddingBottom: 30 }} 
                                content={() => (
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <div style={{
                                                width: "12px",
                                                height: "12px",
                                                backgroundColor: "#4ade80",
                                                marginRight: "5px"
                                            }} />
                                            <span style={{ color: "#333" }}>Rise</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <div style={{
                                                width: "12px",
                                                height: "12px",
                                                backgroundColor: "#f87171",
                                                marginRight: "5px"
                                            }} />
                                            <span style={{ color: "#333" }}>Fall</span>
                                        </div>
                                    </div>
                                )}
                            />

                            <Bar dataKey="percent_change">
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.percent_change >= 0 ? "#4ade80" : "#f87171"} // Green for rise, Red for fall
                                    />
                                ))}
                                {/* Labels positioned outside the bars */}
                                <LabelList 
                                    dataKey="percent_change" 
                                    position="top" 
                                    formatter={(value) => `${value}%`} 
                                    fill="#333" 
                                    fontSize={18} 
                                    offset={5} // Move label further outside
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default CrimeRateChange;
