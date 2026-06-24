const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Permitir peticiones desde React (puerto 5173 de Vite)
app.use(cors());

// Para leer JSON en POST
app.use(express.json());

// Datos simulados (como si vinieran de una base de datos)
const usuarios = [
    { id: 1, nombre: 'Ana Pérez', email: 'ana@email.com' },
    { id: 2, nombre: 'Carlos López', email: 'carlos@email.com' },
    { id: 3, nombre: 'María García', email: 'maria@email.com' }
];

// Endpoint GET para obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    res.json({ success: true, data: usuarios });
});

// Endpoint GET para obtener un usuario por ID
app.get('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) {
        return res.status(404).json({
            success: false,
            error: 'Usuario no encontrado'
        });
    }

    res.json({ success: true, data: usuario });
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo  en http://localhost:${PORT}`);
    console.log('Endpoints disponibles');
    console.log('  GET /api/usuarios');
    console.log('  GET /api/usuarios/:id');
});