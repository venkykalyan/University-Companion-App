const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
app.use('/api/courses',courseRoutes);
app.use('/api',assignmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))