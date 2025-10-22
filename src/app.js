const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');



const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const blogRoutes = require('./routes/blogRoutes');
const profileRoutes = require('./routes/profileRoutes');
const commentRoutes=require('./routes/commentRoutes');


const app = express();

// ✅ Must come BEFORE routes
app.use(cors());
app.use(express.json()); 
app.use(morgan('dev'));


// Routes

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/profile', profileRoutes);
//app.use('/api/comment', commentRoutes);



app.get('/api', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

module.exports = app;
