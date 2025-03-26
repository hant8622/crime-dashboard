import React, { useState } from "react";
import { login } from "../api"; // Import login function

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            await login(username, password);
            onLogin(); // Notify parent component (App.js) that login was successful
        } catch (error) {
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                {error && <p className="text-red-500">{error}</p>}
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="block w-full p-2 border rounded mb-2"/>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full p-2 border rounded mb-2"/>
                <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
            </div>
        </div>
    );
}

export default Login;
