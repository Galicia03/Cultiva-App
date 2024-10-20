const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
require('dotenv').config();

console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MSSQL Configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // or 'localhost\\instance' for local DB
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Use encryption (required for Azure SQL)
        trustServerCertificate: true // Set to true if using local dev SQL server
    }
};

console.log(config);

// Connect to SQL Server and return data
app.get('/plant/:name', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let plantName = req.params.name;
    let result = await pool.request()
      .input('plant_name', sql.VarChar, plantName)
      .query(`
        SELECT 
          p.Nombre AS plant_name, 
          t.Tipo AS tipo_siembra, 
          tm.Tamano AS tamano_maceta, 
          pr.Medida AS profundidad,
          l.Necesidad AS luz_necesidad, 
          l.Horas_min AS luz_horas_min, 
          l.Horas_max AS luz_horas_max,
          r.Necesidad AS riego_necesidad, 
          r.Dias_min AS riego_dias_min, 
          r.Dias_max AS riego_dias_max,
          n.Nombre AS nivel, 
          c.Nombre AS clasificacion,
          te.mes_inicio AS temporada_inicio, 
          te.mes_fin AS temporada_fin,
          tc.Num AS tiempo_cultivo_num,
          tc.[Dia/Ano] AS tiempo_cultivo_dia_ano,
          STRING_AGG(rg.Nombre, ', ') AS regiones  -- Concatenate regions into a single field
        FROM Plantas p
        LEFT JOIN TipoSiembra t ON p.Tipo_Siembra_ID = t.Tipo_Siembra_ID
        LEFT JOIN TamanosMaceta tm ON p.Tamano_maceta_ID = tm.Tamano_maceta_ID
        LEFT JOIN Profundidades pr ON p.Profundidad_ID = pr.Profundidad_ID
        LEFT JOIN Luz l ON p.Luz_ID = l.Luz_ID
        LEFT JOIN Riegos r ON p.Riego_ID = r.Riego_ID
        LEFT JOIN Niveles n ON p.Nivel_ID = n.Nivel_ID
        LEFT JOIN Clasificaciones c ON p.Clasificacion_ID = c.Clasificacion_ID
        LEFT JOIN Temporadas te ON p.Temporada_ID = te.Temporada_ID
        LEFT JOIN TiemposCultivos tc ON p.Tiempo_cultivo_ID = tc.Tiempo_cultivo_ID
        LEFT JOIN RegionesPlantas rp ON p.Planta_ID = rp.Planta_ID
        LEFT JOIN Regiones rg ON rp.Region_ID = rg.Region_ID
        WHERE p.Nombre = @plant_name
        GROUP BY 
          p.Nombre, 
          t.Tipo, 
          tm.Tamano, 
          pr.Medida,
          l.Necesidad, 
          l.Horas_min, 
          l.Horas_max,
          r.Necesidad, 
          r.Dias_min, 
          r.Dias_max,
          n.Nombre, 
          c.Nombre,
          te.mes_inicio, 
          te.mes_fin,
          tc.Num, 
          tc.[Dia/Ano]
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving plant data');
  }
});


// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
