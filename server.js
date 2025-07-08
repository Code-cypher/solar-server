import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import express from "express"
import compression from "compression"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import path from "path"
import { fileURLToPath } from "url"
import authRoutes from "./routes/authRoutes.js"
import blogRoutes from "./routes/blogRoutes.js"
import newsletterRoutes from "./routes/newsletterRoutes.js"
import forumRoutes from "./routes/forumRoutes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const databaseURL = process.env.MONGODB_URI

// Enable gzip compression
app.use(compression())

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve static files from public directory
app.use(express.static('public'))

app.use('/auth', authRoutes)
app.use('/blog', blogRoutes)
app.use('/newsletter', newsletterRoutes)
app.use('/forum', forumRoutes)

// Root endpoint - serve the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
})

// Health check page (beautiful UI)
app.get('/health', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'health.html'))
})

// Health check endpoint (JSON API)
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Solar Blog API is running!',
        timestamp: new Date().toISOString(),
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        },
        uptime: process.uptime()
    })
})


const server = app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`)
    console.log(`📍 Server URL: http://localhost:${port}`)
})

mongoose.connect(databaseURL).then(() => { 
    console.log("✅ Database connected") 
}).catch(err => console.log(`❌ Database connection error: ${err.message}`))
