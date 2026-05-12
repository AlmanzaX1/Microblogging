'use strict';

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors    = require('cors');
const path    = require('path');

const app      = express();
const PORT     = 3000;
const MONGO_URI = 'mongodb+srv://bryan213256_db_user:cAXmZ4kOF2WvmM4q@microblogging.qplomqn.mongodb.net/';
const DB_NAME  = 'Mblogging';

let db;

/* ─── Conexión + índices ─── */
async function connectDB() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);

    // Índices — cada uno en try/catch para no bloquear el arranque
    const idxs = [
        () => db.collection('publicaciones').createIndex({ fechaCreacion: -1 }),
        () => db.collection('publicaciones').createIndex({ autorId: 1, fechaCreacion: -1 }),
        () => db.collection('publicaciones').createIndex({ etiquetas: 1 }),
        () => db.collection('publicaciones').createIndex(
                  { contenido: 'text' }, { default_language: 'spanish' }),
        () => db.collection('usuarios').createIndex({ nombreUsuario: 1 }, { unique: true }),
        () => db.collection('usuarios').createIndex(
                  { correo: 1 }, { unique: true, sparse: true }),
        () => db.collection('usuarios').createIndex(
                  { 'estadisticas.cantidadSeguidores': -1 }),
    ];
    for (const fn of idxs) {
        try { await fn(); } catch { /* índice ya existe o conflicto — se omite */ }
    }

    console.log('✅ Conectado a MongoDB Atlas');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ─── Helper: parsear ObjectId con respuesta limpia ─── */
function toObjId(str, res) {
    try { return new ObjectId(str); }
    catch { if (res) res.status(400).json({ error: 'ID inválido' }); return null; }
}

/* ════════════════════════════════════════════════════════
   PUBLICACIONES — lectura
   ════════════════════════════════════════════════════════ */

// GET /api/publicaciones — feed con paginación, búsqueda y filtros
app.get('/api/publicaciones', async (req, res) => {
    try {
        const { etiqueta, buscar, page = 1, autorId } = req.query;
        const limit  = 20;
        const skip   = (parseInt(page) - 1) * limit;

        const match = {};
        if (etiqueta) match.etiquetas = etiqueta;
        if (buscar)   match.$text     = { $search: buscar };
        if (autorId) {
            const id = toObjId(autorId);
            if (id) match.autorId = id;
        }

        const pipeline = [
            ...(Object.keys(match).length ? [{ $match: match }] : []),
            { $sort: { fechaCreacion: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $lookup: { from: 'usuarios', localField: 'autorId',
                         foreignField: '_id', as: 'autor' } },
            { $unwind: { path: '$autor', preserveNullAndEmptyArrays: true } },
        ];

        const [posts, total] = await Promise.all([
            db.collection('publicaciones').aggregate(pipeline).toArray(),
            db.collection('publicaciones').countDocuments(match),
        ]);

        res.json({ posts, total, page: parseInt(page) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/publicaciones/:id — post con autor + autores de respuestas
app.get('/api/publicaciones/:id', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const post = await db.collection('publicaciones').aggregate([
            { $match: { _id: id } },
            { $lookup: { from: 'usuarios', localField: 'autorId',
                         foreignField: '_id', as: 'autor' } },
            { $unwind: { path: '$autor', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'usuarios', localField: 'respuestas.autorId',
                         foreignField: '_id', as: '_respuestasAutores' } },
        ]).next();

        if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

        // Enriquecer cada respuesta con datos de su autor
        if (post.respuestas?.length && post._respuestasAutores?.length) {
            const mapa = Object.fromEntries(
                post._respuestasAutores.map(a => [a._id.toString(), a])
            );
            post.respuestas = post.respuestas.map(r => ({
                ...r,
                autor: mapa[r.autorId?.toString()] || null,
            }));
        }
        delete post._respuestasAutores;

        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ════════════════════════════════════════════════════════
   PUBLICACIONES — escritura
   ════════════════════════════════════════════════════════ */

// POST /api/publicaciones — crear publicación
app.post('/api/publicaciones', async (req, res) => {
    try {
        const { autorId, contenido, etiquetas = [], urlsMultimedia = [] } = req.body;
        if (!autorId || !contenido?.trim())
            return res.status(400).json({ error: 'autorId y contenido son obligatorios' });

        const aId = toObjId(autorId, res);
        if (!aId) return;

        const nueva = {
            autorId:   aId,
            contenido: contenido.trim(),
            etiquetas: [...new Set(etiquetas.map(t => t.toLowerCase().trim()).filter(Boolean))],
            urlsMultimedia,
            meGusta:   [],
            reposts:   [],
            respuestas: [],
            cantidadMeGusta:    0,
            cantidadReposts:    0,
            cantidadRespuestas: 0,
            editado:      false,
            fechaEdicion: null,
            fechaCreacion: new Date(),
        };

        const result = await db.collection('publicaciones').insertOne(nueva);

        // Mantener contador de posts del usuario
        await db.collection('usuarios').updateOne(
            { _id: aId },
            { $inc: { 'estadisticas.cantidadPosts': 1 } }
        );

        res.status(201).json({ _id: result.insertedId, ...nueva });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/publicaciones/:id — editar contenido/etiquetas
app.put('/api/publicaciones/:id', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const { contenido, etiquetas, urlsMultimedia } = req.body;
        const $set = { editado: true, fechaEdicion: new Date() };

        if (contenido   !== undefined) $set.contenido       = contenido.trim();
        if (etiquetas   !== undefined)
            $set.etiquetas = [...new Set(etiquetas.map(t => t.toLowerCase().trim()).filter(Boolean))];
        if (urlsMultimedia !== undefined) $set.urlsMultimedia = urlsMultimedia;

        const result = await db.collection('publicaciones').updateOne(
            { _id: id }, { $set }
        );
        if (result.matchedCount === 0)
            return res.status(404).json({ error: 'Publicación no encontrada' });

        res.json({ mensaje: 'Publicación actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/publicaciones/:id — eliminar publicación
app.delete('/api/publicaciones/:id', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const post = await db.collection('publicaciones')
            .findOne({ _id: id }, { projection: { autorId: 1 } });

        if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

        await db.collection('publicaciones').deleteOne({ _id: id });

        // Decrementar contador de posts del autor
        await db.collection('usuarios').updateOne(
            { _id: post.autorId },
            { $inc: { 'estadisticas.cantidadPosts': -1 } }
        );

        res.json({ mensaje: 'Publicación eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ════════════════════════════════════════════════════════
   INTERACCIONES: like · repost · comentarios
   ════════════════════════════════════════════════════════ */

// POST /api/publicaciones/:id/like — toggle like
app.post('/api/publicaciones/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId requerido' });

        const postId = toObjId(req.params.id, res); if (!postId) return;
        const uId    = toObjId(userId, res);         if (!uId)    return;

        const post = await db.collection('publicaciones')
            .findOne({ _id: postId }, { projection: { meGusta: 1 } });
        if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

        const yaLiked = (post.meGusta || []).some(id => id.toString() === userId);
        const update  = yaLiked
            ? { $pull:      { meGusta: uId }, $inc: { cantidadMeGusta: -1 } }
            : { $addToSet:  { meGusta: uId }, $inc: { cantidadMeGusta:  1 } };

        const updated = await db.collection('publicaciones').findOneAndUpdate(
            { _id: postId }, update,
            { returnDocument: 'after', projection: { cantidadMeGusta: 1 } }
        );
        res.json({ liked: !yaLiked, cantidadMeGusta: updated.cantidadMeGusta });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/publicaciones/:id/repost — toggle repost
app.post('/api/publicaciones/:id/repost', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId requerido' });

        const postId = toObjId(req.params.id, res); if (!postId) return;
        const uId    = toObjId(userId, res);         if (!uId)    return;

        const post = await db.collection('publicaciones')
            .findOne({ _id: postId }, { projection: { reposts: 1 } });
        if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });

        const yaReposted = (post.reposts || []).some(id => id.toString() === userId);
        const update     = yaReposted
            ? { $pull:     { reposts: uId }, $inc: { cantidadReposts: -1 } }
            : { $addToSet: { reposts: uId }, $inc: { cantidadReposts:  1 } };

        const updated = await db.collection('publicaciones').findOneAndUpdate(
            { _id: postId }, update,
            { returnDocument: 'after', projection: { cantidadReposts: 1 } }
        );
        res.json({ reposted: !yaReposted, cantidadReposts: updated.cantidadReposts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/publicaciones/:id/comentarios — agregar comentario
app.post('/api/publicaciones/:id/comentarios', async (req, res) => {
    try {
        const { autorId, contenido } = req.body;
        if (!autorId || !contenido?.trim())
            return res.status(400).json({ error: 'autorId y contenido son requeridos' });

        const postId = toObjId(req.params.id, res); if (!postId) return;
        const aId    = toObjId(autorId, res);        if (!aId)    return;

        const comentario = {
            _id:            new ObjectId(),
            autorId:        aId,
            contenido:      contenido.trim(),
            meGusta:        [],
            cantidadMeGusta: 0,
            fechaCreacion:  new Date(),
        };

        const result = await db.collection('publicaciones').updateOne(
            { _id: postId },
            { $push: { respuestas: comentario }, $inc: { cantidadRespuestas: 1 } }
        );
        if (result.matchedCount === 0)
            return res.status(404).json({ error: 'Publicación no encontrada' });

        res.status(201).json(comentario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/publicaciones/:id/comentarios/:comentarioId — eliminar comentario
app.delete('/api/publicaciones/:id/comentarios/:comentarioId', async (req, res) => {
    try {
        const postId  = toObjId(req.params.id,           res); if (!postId)  return;
        const commId  = toObjId(req.params.comentarioId, res); if (!commId)  return;

        const result = await db.collection('publicaciones').updateOne(
            { _id: postId },
            { $pull: { respuestas: { _id: commId } }, $inc: { cantidadRespuestas: -1 } }
        );
        if (result.matchedCount === 0)
            return res.status(404).json({ error: 'Publicación no encontrada' });

        res.json({ mensaje: 'Comentario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ════════════════════════════════════════════════════════
   USUARIOS
   ════════════════════════════════════════════════════════ */

// GET /api/usuarios — todos los usuarios (ordenados por seguidores)
app.get('/api/usuarios', async (req, res) => {
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

// GET /api/usuarios/:id
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const usuario = await db.collection('usuarios').findOne(
            { _id: id }, { projection: { hashContraseña: 0 } }
        );
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/usuarios — crear cuenta
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombreUsuario, nombreVisible, hashContraseña,
                biografia = '', correo = '' } = req.body;

        if (!nombreUsuario || !hashContraseña)
            return res.status(400).json({ error: 'nombreUsuario y hashContraseña son obligatorios' });

        const existe = await db.collection('usuarios').findOne({ nombreUsuario });
        if (existe) return res.status(409).json({ error: 'El nombreUsuario ya está en uso' });

        if (correo) {
            const correoExiste = await db.collection('usuarios').findOne({ correo });
            if (correoExiste) return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        const nuevo = {
            nombreUsuario,
            nombreVisible:  nombreVisible || nombreUsuario,
            correo,
            hashContraseña,
            biografia,
            siguiendo:      [],
            fechaCreacion:  new Date(),
            estadisticas:   { cantidadPosts: 0, cantidadSeguidores: 0 },
        };
        const result = await db.collection('usuarios').insertOne(nuevo);
        const { hashContraseña: _, ...sinPassword } = nuevo;
        res.status(201).json({ _id: result.insertedId, ...sinPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/usuarios/:id — editar perfil
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const { nombreVisible, biografia, correo, hashContraseña } = req.body;
        const $set = {};
        if (nombreVisible  !== undefined) $set.nombreVisible  = nombreVisible;
        if (biografia      !== undefined) $set.biografia      = biografia;
        if (correo         !== undefined) $set.correo         = correo;
        if (hashContraseña !== undefined) $set.hashContraseña = hashContraseña;

        const result = await db.collection('usuarios').updateOne({ _id: id }, { $set });
        if (result.matchedCount === 0)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/usuarios/:id
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const result = await db.collection('usuarios').deleteOne({ _id: id });
        if (result.deletedCount === 0)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ════════════════════════════════════════════════════════
   ANALYTICS DE USUARIO — aggregation pipeline
   ════════════════════════════════════════════════════════ */

// GET /api/usuarios/:id/analytics
// Pipeline $facet: calcula 4 agregaciones en una sola pasada
app.get('/api/usuarios/:id/analytics', async (req, res) => {
    try {
        const id = toObjId(req.params.id, res);
        if (!id) return;

        const [raw] = await db.collection('publicaciones').aggregate([
            { $match: { autorId: id } },
            { $facet: {

                // ── 1. Totales de engagement ──────────────────────────
                totales: [
                    { $group: {
                        _id: null,
                        totalPosts:      { $sum: 1 },
                        totalMeGusta:    { $sum: '$cantidadMeGusta' },
                        totalReposts:    { $sum: '$cantidadReposts' },
                        totalRespuestas: { $sum: '$cantidadRespuestas' },
                        promedioLikes:   { $avg: '$cantidadMeGusta' },
                    }},
                    { $project: { _id: 0 } },
                ],

                // ── 2. Post más popular (score = likes + reposts×2 + respuestas) ──
                topPost: [
                    { $addFields: {
                        engagementScore: {
                            $add: [
                                '$cantidadMeGusta',
                                { $multiply: ['$cantidadReposts',   2] },
                                { $multiply: ['$cantidadRespuestas', 1] },
                            ],
                        },
                    }},
                    { $sort:  { engagementScore: -1 } },
                    { $limit: 1 },
                    { $project: {
                        contenido: 1, fechaCreacion: 1, etiquetas: 1,
                        cantidadMeGusta: 1, cantidadReposts: 1,
                        cantidadRespuestas: 1, engagementScore: 1,
                    }},
                ],

                // ── 3. Top 5 etiquetas más usadas ────────────────────
                topEtiquetas: [
                    { $unwind: '$etiquetas' },
                    { $group:  { _id: '$etiquetas', usos: { $sum: 1 } } },
                    { $sort:   { usos: -1 } },
                    { $limit:  5 },
                    { $project: { _id: 0, etiqueta: '$_id', usos: 1 } },
                ],

                // ── 4. Actividad semanal (posts por día de la semana) ─
                actividadSemanal: [
                    { $group: {
                        _id:   { $dayOfWeek: '$fechaCreacion' }, // 1=Dom … 7=Sáb
                        posts: { $sum: 1 },
                        likes: { $sum: '$cantidadMeGusta' },
                    }},
                    { $sort: { _id: 1 } },
                ],
            }},
        ]).toArray();

        const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        res.json({
            totales:    raw.totales[0]  || { totalPosts: 0, totalMeGusta: 0, totalReposts: 0, totalRespuestas: 0, promedioLikes: 0 },
            topPost:    raw.topPost[0]  || null,
            topEtiquetas: raw.topEtiquetas,
            actividadSemanal: raw.actividadSemanal.map(d => ({
                dia:   DIAS[d._id - 1],
                posts: d.posts,
                likes: d.likes,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ════════════════════════════════════════════════════════
   AUTH + STATS
   ════════════════════════════════════════════════════════ */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { nombreUsuario, hashContraseña } = req.body;
        if (!nombreUsuario || !hashContraseña)
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

        const usuario = await db.collection('usuarios')
            .findOne({ nombreUsuario, hashContraseña });
        if (!usuario) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

        const { hashContraseña: _, ...sinPassword } = usuario;
        res.json(sinPassword);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/stats — estadísticas globales + trending
app.get('/api/stats', async (req, res) => {
    try {
        const [totalPosts, totalUsuarios, tagsResult] = await Promise.all([
            db.collection('publicaciones').countDocuments(),
            db.collection('usuarios').countDocuments(),
            db.collection('publicaciones').aggregate([
                { $unwind: '$etiquetas' },
                { $group: { _id: '$etiquetas', count: { $sum: 1 } } },
                { $sort:  { count: -1 } },
                { $limit: 10 },
            ]).toArray(),
        ]);
        res.json({ totalPosts, totalUsuarios, trending: tagsResult });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ─── Arranque ─── */
app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
