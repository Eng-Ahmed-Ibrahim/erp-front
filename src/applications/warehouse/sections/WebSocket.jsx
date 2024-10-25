import React, { useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// // Set Pusher to use WebSocket connection
// window.Pusher = Pusher;

// // Configure Laravel Echo
// export const echo = new Echo({
//   broadcaster: "pusher",
//   key: "pusherKey", // Fallback to 'your-app-key' if env var is not set
//   cluster: "mt1", // Fallback to 'your-app-key' if env var is not set
//   wsHost: "192.168.0.111", // WebSocket server host
//   wsPort: 6001, // WebSocket server port
//   forceTLS: false, // Disable TLS for local development
//   disableStats: true, // Disable stats to reduce load
//   enabledTransports: ["ws", "wss"], // Enable WebSocket and Secure WebSocket
// });
const WebSocketComponent = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Handle connection events
        echo.connector.pusher.connection.bind("connected", () => {
            // console.log("Successfully connected to the WebSocket server.");
        });

        echo.connector.pusher.connection.bind("disconnected", () => {
            // console.log("Disconnected from the WebSocket server.");
        });

        echo.connector.pusher.connection.bind("error", (err) => {
            console.error("Error connecting to the WebSocket server:", err);
        });

        // Listen to the 'orders' channel
        const channel = echo.channel("orders");

        // Listen for the event on the channel
        channel.listen(".App\\Events\\OrderEvent", (event) => {
            // console.log("Received event:", event);
            // Handle the received event
        });
        // Cleanup the subscription on component unmount
        return () => {
            echo.leave("orders");
            echo.connector.pusher.connection.unbind("connected");
            echo.connector.pusher.connection.unbind("disconnected");
            echo.connector.pusher.connection.unbind("error");
        };
    }, []);

    return (
        <div>
            <h1>WebSocket Messages</h1>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{JSON.stringify(message)}</li>
                ))}
            </ul>
        </div>
    );
};

export default WebSocketComponent;
