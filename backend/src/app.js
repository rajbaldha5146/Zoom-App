import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb+srv://usedummy0:m7R0j2hY3vLvGwMZ@cluster0.wusyo.mongodb.net/Zoom")

        console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
        
        const port = app.get("port");
        server.listen(port, () => {
            console.log(`LISTENING ON PORT ${port}`)
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ ERROR: Port ${port} is already in use!`)
                console.error(`Please kill the process using port ${port} or use a different port.\n`)
                console.error('To find and kill the process:')
                console.error(`  Windows: netstat -ano | findstr :${port}`)
                console.error(`  Then: taskkill /PID <PID> /F`)
                process.exit(1);
            } else {
                throw err;
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();