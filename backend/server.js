const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const recruiterRoutes = require('./routes/recruiters');
const adminRoutes = require('./routes/admin');

const app = express();


app.use(cors());
app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/admin', adminRoutes);


app.get('/health', (req, res) => {
  res.json({ message: 'College Placement Portal API is running successfully.' });
});


const PORT = process.env.PORT || 3001;


async function initDB() {
  try {
    console.log("Checking database tables...");
    const hasUsersTable = await db.schema.hasTable('users');
    if (!hasUsersTable) {
      console.log("Database empty. Running migrations...");
      await db.migrate.latest();
      console.log("Migrations complete. Seeding database...");
      await db.seed.run();
      console.log("Database seeded successfully!");
    } else {
      console.log("Database tables verified.");
    }
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Express server is running on port ${PORT}`);
  
  await initDB();
});
