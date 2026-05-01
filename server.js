const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb+srv://bryan213256_db_user:cAXmZ4kOF2WvmM4q@microblogging.qplomqn.mongodb.net/';
const DB_NAME = 'Mblogging';

let db;

async function connectDB() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Conectado a MongoDB Atlas');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET todas las publicaciones con datos del autor
app.get('/api/publicaciones', async(req, res) => {
    try {
        const { etiqueta, buscar, page = 1 } = req.query;
        const limit = 20;
        const skip = (parseInt(page) - 1) * limit;

        const matchFilter = {};
        if (etiqueta) matchFilter.etiquetas = etiqueta;
        if (buscar) matchFilter.contenido = { $regex: buscar, $options: 'i' };

        const pipeline = [];
        if (Object.keys(matchFilter).length > 0) {
            pipeline.push({ $match: matchFilter });
        }
        pipeline.push({ $sort: { fechaCreacion: -1 } }, { $skip: skip }, { $limit: limit }, {
            $lookup: {
                from: 'usuarios',
                localField: 'autorId',
                foreignField: '_id',
                as: 'autor'
            }
        }, { $unwind: { path: '$autor', preserveNullAndEmptyArrays: true } });

        const [posts, total] = await Promise.all([
            db.collection('publicaciones').aggregate(pipeline).toArray(),
            db.collection('publicaciones').countDocuments(matchFilter)
        ]);
        res.json({ posts, total, page: parseInt(page) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET todos los usuarios
app.get('/api/usuarios', async(req, res) => {
    try {
        const usuarios = await db.collection('usuarios')
            .find({}, { projection: { hashContraseña: 0 } })
            .sort({ 'estadisticas.cantidadSeguidores': -1 })
            .toArray();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET estadísticas generales
app.get('/api/stats', async(req, res) => {
    try {
        const [totalPosts, totalUsuarios, tagsResult] = await Promise.all([
            db.collection('publicaciones').countDocuments(),
            db.collection('usuarios').countDocuments(),
            db.collection('publicaciones').aggregate([
                { $unwind: '$etiquetas' },
                { $group: { _id: '$etiquetas', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).toArray()
        ]);
        res.json({ totalPosts, totalUsuarios, trending: tagsResult });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET una publicacion por id
app.get('/api/publicaciones/:id', async(req, res) => {
    try {
        const post = await db.collection('publicaciones').aggregate([
            { $match: { _id: new ObjectId(req.params.id) } },
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'autorId',
                    foreignField: '_id',
                    as: 'autor'
                }
            },
            { $unwind: { path: '$autor', preserveNullAndEmptyArrays: true } }
        ]).next();

        if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, async() => {
    await connectDB();
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});