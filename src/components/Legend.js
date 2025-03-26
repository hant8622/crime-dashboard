import React from "react";

function Legend() {
    const colorScale = [
        { label: "500+ crimes", color: "#FF0000", name: "Red" },  
        { label: "250 - 500", color: "#FF4500", name: "Red-Orange" },
        { label: "100 - 250", color: "#FF8C00", name: "Orange" },  
        { label: "50 - 100", color: "#FFD700", name: "Yellow" },
        { label: "10 - 50", color: "#1E90FF", name: "Blue" },
        { label: "<10 crimes", color: "#0000FF", name: "Dark Blue" }  
    ];

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-200 p-4 rounded-lg shadow-lg z-10 border border-gray-400">
            <h3 className="font-bold text-sm mb-2 text-center">Crime Density</h3>
            <div className="flex flex-col space-y-1">
                {colorScale.map((item, index) => (
                    <div key={index} className="text-xs font-medium">
                        {item.label}: 
                        <span 
                            style={{ 
                                color: item.color, 
                                textShadow: "1px 1px 2px black" 
                            }}
                        > {item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Legend;
