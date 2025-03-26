import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function Trends() {
    const [data, setData] = useState({});
    const [stateFilter, setStateFilter] = useState([]);
    const [states, setStates] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTypes, setSelectedTypes] = useState(["All"]);



    useEffect(() => {
        fetch("http://127.0.0.1:5050/api/filters")
            .then((res) => res.json())
            .then(({ states, types }) => {
                const cleanedStates = [...new Set(states.filter(Boolean))];
                const cleanedTypes = [...new Set(types.filter(t => t && t !== "All"))];
    
                setStates(cleanedStates);
                setTypes(cleanedTypes);
            })
            
            .catch(err => console.error("Failed to fetch filters:", err));
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true); // show loading state
            const allData = {};
          
            if (selectedTypes.length > 0 && stateFilter.length > 0) {
              for (let state of stateFilter) {
                let url = `http://127.0.0.1:5050/crime-trends?state=${encodeURIComponent(state)}&type=${encodeURIComponent(selectedTypes[0])}`;
                
                const res = await fetch(url);
                const rawData = await res.json();
          
                rawData.forEach(entry => {
                  const date = new Date(entry.date).toISOString().split("T")[0];
                  if (!allData[date]) allData[date] = { date };
                  allData[date][state] = entry.crimes;
                });
              }
          
              const merged = Object.values(allData).sort((a, b) => new Date(a.date) - new Date(b.date));
              setData(merged);
            } else {
              setData([]);
            }
          
            setLoading(false);
          }
    
        if (selectedTypes.length > 0) {
            fetchData();
        } else {
            setData([]);
            setLoading(false); // 👈 Stop loading even when no types are selected
        }
    }, [stateFilter, selectedTypes]);


    return (
        <div className="p-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Crime Trends Over Time</h2>
      
          {/* Filters */}
          <div className="mb-8 pb-4 border-b border-gray-200">
            <div className="flex flex-col space-y-4">
          {/* Crime Type Dropdown */}
            <select
                className="p-2 border border-gray-300 rounded-md text-sm"
                value={selectedTypes[0] || ""}
                onChange={(e) => setSelectedTypes([e.target.value])}
            >
                <option value="All">All Crime Types</option> 
                {types.map((type) => (
                <option key={type} value={type}>{type}</option>
                ))}
            </select>

            {/* State Checkboxes */}
            <div className="flex flex-wrap gap-3 items-center text-sm mb-6">
                <span className="font-medium mr-2">Select States:</span>
                {states.map((state) => (
                <label key={state} className="flex items-center space-x-1">
                    <input
                    type="checkbox"
                    value={state}
                    checked={stateFilter.includes(state)}
                    onChange={() =>
                        setStateFilter((prev) =>
                        prev.includes(state)
                            ? prev.filter((s) => s !== state)
                            : [...prev, state]
                        )
                    }
                    />
                    <span>{state}</span>
                </label>
                ))}
                </div>
            </div>
            </div>

      
          {/* Chart */}
          <div className="bg-white border rounded-xl shadow p-4 mt-4">
            {loading ? (
              <div className="text-center text-gray-500 py-20">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => new Date(tick).getFullYear()}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  {stateFilter.map((state) => (
                    <Line
                        key={state}
                        type="monotone"
                        dataKey={state}
                        name={state}
                        stroke={"#" + Math.floor(Math.random() * 16777215).toString(16)}
                        dot={false}
                        strokeWidth={2}
                    />
                    ))}

                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      );
      
}

export default Trends;