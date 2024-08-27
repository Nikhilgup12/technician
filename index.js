const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const dbpath1 = path.join(__dirname, "Users.db");
// const dbpath2 = path.join(__dirname, "technicians.db");
const app = express();
const cors = require('cors');
const jwt = require("jsonwebtoken");
app.use(cors());
app.use(express.json());
let db = null 
let database = null 
const initialize = async () => {
    try {
      db = await open({
        filename: dbpath1,
        driver: sqlite3.Database,
      });
  
    //   database = await open({
    //     filename: dbpath2,
    //     driver: sqlite3.Database,
    //   });
      app.listen(3000, () => {
        console.log(`Server is running on 3000`);
      });
    } catch (e) {
      console.log(`Error message `);
      process.exit(1);
    }
  };

  initialize();


  app.post("/user-login", async (request, response) => {
    const { array } = request.body;
    for (const data of array) {
      const { id, email, password } = data;
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`Hashed Password: ${hashedPassword}`);
      const insertUser = `
        INSERT INTO userData (id, email, password)
        VALUES (?, ?, ?)
      `;
      try {
        await db.run(insertUser, [id, email, hashedPassword]);
        console.log(`Inserted user: ${email}`);
      } catch (error) {
        console.error("Error inserting user:", error);
      }
    }
    response.send("User successfully added.");
  });
  
  app.post("/technician-login", async (request, response) => {
    const { array } = request.body;
    for (const data of array) {
      const { id, email, password, business_name } = data;
      try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password,10);
        const insertTechnician = `
          INSERT INTO technicianData (id, email, password, business_name)
          VALUES (?, ?, ?, ?)
        `;
        await db.run(insertTechnician, [id, email, hashedPassword, business_name]);
        console.log(`Inserted technician: ${email}`);
      } catch (error) {
        console.error("Error inserting technician:", error);
      }
    }
    response.send("Technician successfully added.");
  });
  
  app.delete("/techniciandelete", async (request, response) => {
    const { email } = request.body;
    try {
      const query = `DELETE FROM technicianData WHERE email = ?`;
      const result = await db.run(query, [email]);
  
      if (result.changes > 0) {
        response.status(200).send("User successfully deleted.");
      } else {
        response.status(404).send("User not found.");
      }
    } catch (error) {
      console.error("Error executing query:", error);
      response.status(500).send("Internal Server Error");
    }
  });
  
  app.post("/userlogin", async (request, response) => {
    const { email, password } = request.body;
    try {
      const query = `SELECT * FROM userData WHERE email = ?`;
      const user = await db.get(query, [email]); // Use `db.get` for single row
      const pass =  await bcrypt.compare(password, user.password)
      if (user && pass) {
        response.status(200).send("User login success");
      } else {
        response.status(401).send("Invalid credentials");
      }
    } catch (error) {
      console.error("Error executing query:", error);
      response.status(500).send("Internal Server Error");
    }
  });
  
  app.post("/technicianlogin", async (request, response) => {
    const { email, password } = request.body;
    try {
      const query = `SELECT * FROM technicianData WHERE email = ?`;
      const technician = await db.get(query, [email]); // Use `db.get` for single row
  
      // Check if the technician exists and if the password is correct
      if (technician && await bcrypt.compare(password, technician.password)) {
        response.status(200).send("Technician login success");
      } else {
        response.status(401).send("Invalid credentials");
      }
    } catch (error) {
      console.error("Error executing query:", error);
      response.status(500).send("Internal Server Error");
    }
  });
  

