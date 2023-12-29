const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public/common'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/common');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const connection = mysql.createConnection({
  host: 'mysql-35152716-dk061106-6049.a.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_rj92Xf7842HUHplRN7a',
  port: '21068',
  database: 'secret_data',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/upload/all', upload.fields([{ name: 'logo' }, { name: 'image1' }, { name: 'image2' }, { name: 'image3' }]), (req, res) => {
  const { feName, feType, barangay, description, operatingHours, menu, location, locationDescription } = req.body;
  const textColumns = ['feName', 'feType', 'barangay', 'description', 'operatingHours', 'menu', 'location', 'locationDescription'];
  const imageColumns = ['logo', 'image1', 'image2', 'image3'];

  try {
    const textValues = textColumns.map(column => `'${req.body[column]}'`);
    const imageValues = imageColumns.map(column => `'${req.files[column][0].filename}'`);
    const values = [...imageValues, ...textValues];

    const insertQuery = `INSERT INTO images (${[...imageColumns, ...textColumns].join(', ')}) VALUES (${values})`;

    connection.query(insertQuery, (err, result) => {
      if (err) {
        console.error('Error inserting into the database: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log('Data inserted successfully');
        res.status(200).json({ message: 'Text and images uploaded successfully' });
      }
    });
  } catch (error) {
    console.error('Error uploading text and images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res)=> {
  const sql = "SELECT * FROM images"
  connection.query(sql, (err, data)=> {
      if (err) return res.json(err);
      return res.json(data);
  })
})

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});
