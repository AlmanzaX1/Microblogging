/* global use, db */
// MongoDB Playground - Usuarios y Publicaciones

use("Mblogging");

// ===== 1. LIMPIAR COLECCIONES =====
db.usuarios.drop();
db.publicaciones.drop();

// ===== 2. INSERTAR USUARIOS =====
const uid1  = new ObjectId(); const uid2  = new ObjectId();
const uid3  = new ObjectId(); const uid4  = new ObjectId();
const uid5  = new ObjectId(); const uid6  = new ObjectId();
const uid7  = new ObjectId(); const uid8  = new ObjectId();
const uid9  = new ObjectId(); const uid10 = new ObjectId();

db.usuarios.insertMany([
    {
        _id: uid1,
        nombreUsuario: "carlos_dev",
        nombreVisible: "Carlos Mendoza",
        hashContraseña: "hashed_pw_1",
        biografia: "Desarrollador fullstack. Next.js + TypeScript lover.",
        siguiendo: [uid2, uid3, uid5],
        estadisticas: { cantidadPosts: 5, cantidadSeguidores: 120 }
    },
    {
        _id: uid2,
        nombreUsuario: "sofia_design",
        nombreVisible: "Sofía Ramírez",
        hashContraseña: "hashed_pw_2",
        biografia: "UX/UI Designer. Apasionada por el branding y la identidad visual.",
        siguiendo: [uid1, uid4, uid6],
        estadisticas: { cantidadPosts: 4, cantidadSeguidores: 98 }
    },
    {
        _id: uid3,
        nombreUsuario: "miguel_ing",
        nombreVisible: "Miguel Torres",
        hashContraseña: "hashed_pw_3",
        biografia: "Estudiante de ingeniería electrónica. Arduino y Python.",
        siguiendo: [uid1, uid9, uid10],
        estadisticas: { cantidadPosts: 4, cantidadSeguidores: 75 }
    },
    {
        _id: uid4,
        nombreUsuario: "laura_foto",
        nombreVisible: "Laura Gómez",
        hashContraseña: "hashed_pw_4",
        biografia: "Fotógrafa y videasta. Colombia desde el aire.",
        siguiendo: [uid5, uid8, uid9],
        estadisticas: { cantidadPosts: 4, cantidadSeguidores: 210 }
    },
    {
        _id: uid5,
        nombreUsuario: "andres_chef",
        nombreVisible: "Andrés Vargas",
        hashContraseña: "hashed_pw_5",
        biografia: "Chef profesional. Gastronomía colombiana e italiana.",
        siguiendo: [uid2, uid8, uid10],
        estadisticas: { cantidadPosts: 4, cantidadSeguidores: 185 }
    },
    {
        _id: uid6,
        nombreUsuario: "valentina_art",
        nombreVisible: "Valentina Cruz",
        hashContraseña: "hashed_pw_6",
        biografia: "Artista digital. Fanart, retratos y speedpaints.",
        siguiendo: [uid1, uid3, uid7],
        estadisticas: { cantidadPosts: 4, cantidadSeguidores: 310 }
    },
    {
        _id: uid7,
        nombreUsuario: "jorge_musica",
        nombreVisible: "Jorge Patiño",
        hashContraseña: "hashed_pw_7",
        biografia: "Guitarrista. Blues, flamenco y jazz. EP en proceso.",
        siguiendo: [uid6, uid9, uid10],
        estadisticas: { cantidadPosts: 3, cantidadSeguidores: 145 }
    },
    {
        _id: uid8,
        nombreUsuario: "daniela_nutricion",
        nombreVisible: "Daniela Ríos",
        hashContraseña: "hashed_pw_8",
        biografia: "Nutricionista. Alimentación saludable sin aburrirse.",
        siguiendo: [uid5, uid9, uid4],
        estadisticas: { cantidadPosts: 3, cantidadSeguidores: 220 }
    },
    {
        _id: uid9,
        nombreUsuario: "sebastian_fit",
        nombreVisible: "Sebastián López",
        hashContraseña: "hashed_pw_9",
        biografia: "Atleta amateur. Running, HIIT y maratones.",
        siguiendo: [uid8, uid3, uid1],
        estadisticas: { cantidadPosts: 3, cantidadSeguidores: 175 }
    },
    {
        _id: uid10,
        nombreUsuario: "paula_math",
        nombreVisible: "Paula Herrera",
        hashContraseña: "hashed_pw_10",
        biografia: "Matemática. Paradojas, álgebra de grupos y caos.",
        siguiendo: [uid1, uid3, uid6],
        estadisticas: { cantidadPosts: 3, cantidadSeguidores: 130 }
    }
]);

// ===== 3. INSERTAR PUBLICACIONES =====
const now = new Date();
const daysAgo = d => new Date(now - d * 86400000);

const p1  = new ObjectId(); const p2  = new ObjectId();
const p3  = new ObjectId(); const p4  = new ObjectId();
const p5  = new ObjectId(); const p6  = new ObjectId();
const p7  = new ObjectId(); const p8  = new ObjectId();
const p9  = new ObjectId(); const p10 = new ObjectId();
const p11 = new ObjectId(); const p12 = new ObjectId();
const p13 = new ObjectId(); const p14 = new ObjectId();
const p15 = new ObjectId(); const p16 = new ObjectId();
const p17 = new ObjectId(); const p18 = new ObjectId();
const p19 = new ObjectId(); const p20 = new ObjectId();
const p21 = new ObjectId(); const p22 = new ObjectId();
const p23 = new ObjectId(); const p24 = new ObjectId();
const p25 = new ObjectId(); const p26 = new ObjectId();
const p27 = new ObjectId(); const p28 = new ObjectId();
const p29 = new ObjectId(); const p30 = new ObjectId();

db.publicaciones.insertMany([
    {
        _id: p1, autorId: uid1, fechaCreacion: daysAgo(0.1),
        contenido: "Acabo de lanzar mi portafolio con Next.js y Tailwind. Tres semanas de trabajo pero valió cada línea de código. Link en bio!",
        urlsMultimedia: ["https://media.correo.com/p1_preview.jpg"],
        etiquetas: ["webdev", "nextjs", "tailwind", "portfolio"],
        meGusta: [uid2, uid3, uid5, uid6], reposts: [uid4, uid7],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid2, contenido: "Se ve increíble! Cuánto tiempo tomó el diseño responsivo?", urlsMultimedia: [], meGusta: [uid1, uid3], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid5, contenido: "Definitivamente un referente. Lo comparto con mi equipo.", urlsMultimedia: [], meGusta: [uid1], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p2, autorId: uid2, fechaCreacion: daysAgo(0.3),
        contenido: "Mi golden retriever aprendió a abrir la nevera. Ya no sé si es gracioso o un problema.",
        urlsMultimedia: ["https://media.correo.com/p2_perro.mp4"],
        etiquetas: ["mascotas", "perros", "goldenretriever", "humor"],
        meGusta: [uid1, uid3, uid4, uid6, uid8, uid9], reposts: [uid3, uid5, uid10],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 6,
        respuestas: [
            { _id: new ObjectId(), autorId: uid4, contenido: "Jajaja lo mismo le pasó al mío hace un mes, lo grabé y se hizo viral.", urlsMultimedia: [], meGusta: [uid2, uid6], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid9, contenido: "Es un problema de seguridad alimentaria del perro xD ponle seguro.", urlsMultimedia: [], meGusta: [uid2], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p3, autorId: uid3, fechaCreacion: daysAgo(0.5),
        contenido: "Parciales terminados. Sobreviví termodinámica con un 3.8. La noche de mañana es mía.",
        urlsMultimedia: [],
        etiquetas: ["universidad", "ingenieria", "estudiante", "parciales"],
        meGusta: [uid1, uid2, uid6, uid7], reposts: [uid2],
        cantidadRespuestas: 1, cantidadReposts: 1, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid7, contenido: "Eso se celebra! A qué hora empieza la noche? 😂", urlsMultimedia: [], meGusta: [uid3, uid1], cantidadRespuestas: 0, cantidadMeGusta: 2 }
        ]
    },
    {
        _id: p4, autorId: uid4, fechaCreacion: daysAgo(1),
        contenido: "Estas fotos las tomé al amanecer en el Parque Tayrona. Sin filtros, sin edición. La naturaleza hace su trabajo.",
        urlsMultimedia: ["https://media.correo.com/p4_tayrona1.jpg", "https://media.correo.com/p4_tayrona2.jpg", "https://media.correo.com/p4_tayrona3.jpg"],
        etiquetas: ["fotografia", "naturaleza", "colombia", "tayrona", "amanecer"],
        meGusta: [uid1, uid2, uid3, uid5, uid6, uid7, uid8, uid10], reposts: [uid1, uid6, uid9],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 8,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "Que paisaje tan brutal. Qué cámara usas?", urlsMultimedia: [], meGusta: [uid4, uid5], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid6, contenido: "Esta segunda foto merece ser un cuadro en una galería.", urlsMultimedia: [], meGusta: [uid4, uid2, uid3], cantidadRespuestas: 0, cantidadMeGusta: 3 }
        ]
    },
    {
        _id: p5, autorId: uid5, fechaCreacion: daysAgo(1.5),
        contenido: "Receta del día: risotto de champiñones con trufa negra. El secreto está en el caldo caliente y la paciencia. Nunca dejen de revolver.",
        urlsMultimedia: ["https://media.correo.com/p5_risotto.jpg"],
        etiquetas: ["cocina", "recetas", "risotto", "chef", "gastronomia"],
        meGusta: [uid2, uid4, uid6, uid8, uid9], reposts: [uid8, uid10],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid8, contenido: "Cuánto tiempo de cocción le das al arroz arborio?", urlsMultimedia: [], meGusta: [uid5], cantidadRespuestas: 0, cantidadMeGusta: 1 },
            { _id: new ObjectId(), autorId: uid2, contenido: "Hice esta receta el fin de semana, resultó espectacular!", urlsMultimedia: [], meGusta: [uid5, uid4], cantidadRespuestas: 0, cantidadMeGusta: 2 }
        ]
    },
    {
        _id: p6, autorId: uid6, fechaCreacion: daysAgo(2),
        contenido: "Nuevo fanart de Demon Slayer terminado. Dibujé a Nezuko en acuarela digital. Tardé 6 horas pero estoy muy orgullosa del resultado.",
        urlsMultimedia: ["https://media.correo.com/p6_fanart_nezuko.jpg"],
        etiquetas: ["anime", "fanart", "demonslayer", "artedigital", "acuarela"],
        meGusta: [uid3, uid7, uid9, uid10], reposts: [uid3, uid7],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid3, contenido: "Los colores son una locura. Qué tablet usas para esto?", urlsMultimedia: [], meGusta: [uid6, uid7], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid10, contenido: "Impresionante el detalle en los ojos. Tienes mucho talento.", urlsMultimedia: [], meGusta: [uid6], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p7, autorId: uid7, fechaCreacion: daysAgo(2.5),
        contenido: "Grabé una nueva canción original. Mezcla de blues y flamenco. Déjenme saber qué opinan, es el primer tema del EP que estoy preparando.",
        urlsMultimedia: ["https://media.correo.com/p7_cancion_preview.mp3"],
        etiquetas: ["musica", "blues", "flamenco", "guitarra", "EP"],
        meGusta: [uid1, uid6, uid8, uid9, uid10], reposts: [uid6, uid9],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid9, contenido: "La intro con la guitarra española está brutal. Avísame cuando salga el EP.", urlsMultimedia: [], meGusta: [uid7, uid1], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid1, contenido: "Suena muy profesional para ser un indie. Qué DAW usas?", urlsMultimedia: [], meGusta: [uid7], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p8, autorId: uid8, fechaCreacion: daysAgo(3),
        contenido: "Mito derribado: no todo lo saludable sabe mal. Este bowl de açaí con granola, banana y mantequilla de maní es el desayuno perfecto.",
        urlsMultimedia: ["https://media.correo.com/p8_acai_bowl.jpg"],
        etiquetas: ["nutricion", "saludable", "desayuno", "acai", "bienestar"],
        meGusta: [uid2, uid4, uid5, uid9, uid10], reposts: [uid5, uid10],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid5, contenido: "Como chef apruebo este desayuno. La combinación de texturas es clave.", urlsMultimedia: [], meGusta: [uid8, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid4, contenido: "Se ve delicioso y la presentación es perfecta para fotos.", urlsMultimedia: [], meGusta: [uid8], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p9, autorId: uid9, fechaCreacion: daysAgo(4),
        contenido: "30 días haciendo sentadillas todos los días. Resultado: +4 kg de músculo, mejor postura y cero dolor de espalda. La constancia es el mejor suplemento.",
        urlsMultimedia: ["https://media.correo.com/p9_antes.jpg", "https://media.correo.com/p9_despues.jpg"],
        etiquetas: ["fitness", "gym", "sentadillas", "transformacion", "salud"],
        meGusta: [uid1, uid3, uid5, uid7, uid8, uid10], reposts: [uid3, uid8],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 6,
        respuestas: [
            { _id: new ObjectId(), autorId: uid8, contenido: "Excelente resultado! Qué dieta acompañó el proceso?", urlsMultimedia: [], meGusta: [uid9, uid1], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid3, contenido: "Inspiración pura. Yo voy por el día 7, no me rindo.", urlsMultimedia: [], meGusta: [uid9], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p10, autorId: uid10, fechaCreacion: daysAgo(5),
        contenido: "Resolver el cubo de Rubik en menos de 2 minutos usando solo álgebra de grupos. Hice un hilo explicando la lógica matemática detrás.",
        urlsMultimedia: ["https://media.correo.com/p10_rubik.mp4"],
        etiquetas: ["matematicas", "rubik", "puzzle", "algebra", "ciencia"],
        meGusta: [uid1, uid3, uid6, uid7], reposts: [uid1, uid3],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "Nunca había pensado en el cubo de Rubik desde esa perspectiva. Excelente hilo.", urlsMultimedia: [], meGusta: [uid10, uid3], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid6, contenido: "Lo aprendí por el método CFOP y ahora esto me vuela la cabeza.", urlsMultimedia: [], meGusta: [uid10], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p11, autorId: uid1, fechaCreacion: daysAgo(6),
        contenido: "Hot take: TypeScript es obligatorio en cualquier proyecto que dure más de un mes. No acepto debates.",
        urlsMultimedia: [],
        etiquetas: ["typescript", "programacion", "webdev", "opinion"],
        meGusta: [uid2, uid6, uid10], reposts: [uid10],
        cantidadRespuestas: 2, cantidadReposts: 1, cantidadMeGusta: 3,
        respuestas: [
            { _id: new ObjectId(), autorId: uid10, contenido: "Acepto el debate: el tipado estricto en proyectos pequeños es over-engineering.", urlsMultimedia: [], meGusta: [uid3, uid5], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid2, contenido: "Totalmente de acuerdo. Me salvó de tres bugs críticos esta semana.", urlsMultimedia: [], meGusta: [uid1], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p12, autorId: uid4, fechaCreacion: daysAgo(7),
        contenido: "Workshop de fotografía este sábado en Medellín. Aprenderemos composición, luz natural y edición en Lightroom. Cupos limitados, link en bio.",
        urlsMultimedia: ["https://media.correo.com/p12_workshop_flyer.jpg"],
        etiquetas: ["fotografia", "workshop", "medellin", "lightroom", "curso"],
        meGusta: [uid1, uid2, uid6, uid7, uid9], reposts: [uid6, uid7],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid6, contenido: "Ya me inscribí! Tengo muchas dudas sobre la edición de portraits.", urlsMultimedia: [], meGusta: [uid4], cantidadRespuestas: 0, cantidadMeGusta: 1 },
            { _id: new ObjectId(), autorId: uid7, contenido: "Lástima que ese día tengo presentación. Para el próximo me anoto!", urlsMultimedia: [], meGusta: [uid4, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 }
        ]
    },
    {
        _id: p13, autorId: uid5, fechaCreacion: daysAgo(8),
        contenido: "El error más común al hacer pasta carbonara: agregar crema de leche. La receta original italiana solo lleva huevo, guanciale, pecorino y pimienta negra.",
        urlsMultimedia: ["https://media.correo.com/p13_carbonara.jpg"],
        etiquetas: ["cocina", "pasta", "carbonara", "italia", "gastronomia"],
        meGusta: [uid2, uid4, uid6, uid8], reposts: [uid2, uid8],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid2, contenido: "Toda mi vida haciéndola mal. Gracias por la corrección chef!", urlsMultimedia: [], meGusta: [uid5, uid4], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid8, contenido: "Confirmado desde la nutrición: la versión original también es más sana.", urlsMultimedia: [], meGusta: [uid5], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p14, autorId: uid3, fechaCreacion: daysAgo(9),
        contenido: "Construí un brazo robótico con Arduino para mi proyecto de semestre. Costo total: 45 dólares. Puede levantar hasta 500 gramos.",
        urlsMultimedia: ["https://media.correo.com/p14_robot_arm.mp4", "https://media.correo.com/p14_robot_foto.jpg"],
        etiquetas: ["arduino", "robotica", "ingenieria", "diy", "electronica"],
        meGusta: [uid1, uid6, uid7, uid9, uid10], reposts: [uid1, uid10],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "Impresionante para el presupuesto. Qué servo motors usaste?", urlsMultimedia: [], meGusta: [uid3, uid10], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid10, contenido: "El algoritmo de control cinemático inverso lo programaste tú?", urlsMultimedia: [], meGusta: [uid3], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p15, autorId: uid8, fechaCreacion: daysAgo(10),
        contenido: "5 alimentos que nunca deberían faltarte en casa si quieres comer bien sin gastar mucho: avena, huevos, lentejas, plátano y arroz integral.",
        urlsMultimedia: ["https://media.correo.com/p15_alimentos.jpg"],
        etiquetas: ["nutricion", "alimentacion", "saludable", "presupuesto", "consejos"],
        meGusta: [uid2, uid4, uid5, uid6, uid9, uid10], reposts: [uid4, uid5, uid9],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 6,
        respuestas: [
            { _id: new ObjectId(), autorId: uid5, contenido: "Yo añadiría el aceite de oliva virgen extra. Fundamental en cualquier cocina.", urlsMultimedia: [], meGusta: [uid8, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid9, contenido: "La proteína del huevo es insuperable para el post-entreno. Gran lista.", urlsMultimedia: [], meGusta: [uid8], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p16, autorId: uid2, fechaCreacion: daysAgo(11),
        contenido: "Nuevo diseño de identidad visual para una cafetería local. Paleta cálida, tipografía serif y logo minimalista. El cliente quedó feliz y yo también.",
        urlsMultimedia: ["https://media.correo.com/p16_logo.jpg", "https://media.correo.com/p16_branding.jpg"],
        etiquetas: ["uxui", "diseño", "branding", "identidadvisual", "logo"],
        meGusta: [uid1, uid4, uid6, uid7, uid10], reposts: [uid6, uid7],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid6, contenido: "El logo es precioso. Qué fuente usaste para el nombre de la cafetería?", urlsMultimedia: [], meGusta: [uid2, uid1], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid4, contenido: "La paleta de colores es perfecta. Me encanta cómo transmite calidez.", urlsMultimedia: [], meGusta: [uid2], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p17, autorId: uid7, fechaCreacion: daysAgo(12),
        contenido: "Opinión de músico: los altavoces bluetooth portátiles nunca van a reemplazar un buen par de monitores de estudio. El rango de frecuencias no miente.",
        urlsMultimedia: [],
        etiquetas: ["musica", "audio", "produccion", "estudio", "opinion"],
        meGusta: [uid1, uid3, uid9], reposts: [uid1],
        cantidadRespuestas: 2, cantidadReposts: 1, cantidadMeGusta: 3,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "Confirmado. Mezclé un podcast en bluetooth y en monitores sonaba completamente diferente.", urlsMultimedia: [], meGusta: [uid7, uid3], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid3, contenido: "Qué monitores recomiendas para producción de entrada?", urlsMultimedia: [], meGusta: [uid7], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p18, autorId: uid6, fechaCreacion: daysAgo(13),
        contenido: "Speed paint de 3 horas resumido en 60 segundos. Esta vez pinté un paisaje de otoño japonés inspirado en el Studio Ghibli.",
        urlsMultimedia: ["https://media.correo.com/p18_speedpaint.mp4", "https://media.correo.com/p18_final.jpg"],
        etiquetas: ["artedigital", "speedpaint", "ghibli", "japon", "fanart"],
        meGusta: [uid3, uid4, uid7, uid9, uid10], reposts: [uid3, uid4, uid10],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid4, contenido: "Los fondos de Ghibli son tan únicos. Lo capturaste muy bien.", urlsMultimedia: [], meGusta: [uid6, uid3], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid10, contenido: "Hay una simetría matemática en la composición que me encanta.", urlsMultimedia: [], meGusta: [uid6], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p19, autorId: uid9, fechaCreacion: daysAgo(14),
        contenido: "Rutina HIIT de 20 minutos sin equipo que puedes hacer en casa. La hago cada mañana antes del desayuno.",
        urlsMultimedia: ["https://media.correo.com/p19_hiit_rutina.jpg"],
        etiquetas: ["hiit", "fitness", "ejercicioenocasa", "rutina", "salud"],
        meGusta: [uid1, uid3, uid5, uid7, uid8], reposts: [uid3, uid8],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid8, contenido: "Para complementar esto te recomiendo tomar proteína 30 min antes.", urlsMultimedia: [], meGusta: [uid9, uid1], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid3, contenido: "Llevo una semana con esta rutina y ya noto la diferencia en resistencia.", urlsMultimedia: [], meGusta: [uid9], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p20, autorId: uid10, fechaCreacion: daysAgo(15),
        contenido: "Hilo sobre por qué el número pi aparece en fórmulas que no tienen nada que ver con círculos. La respuesta tiene que ver con la distribución normal y las transformadas de Fourier.",
        urlsMultimedia: ["https://media.correo.com/p20_pi_formula.jpg"],
        etiquetas: ["matematicas", "pi", "fourier", "estadistica", "ciencia"],
        meGusta: [uid1, uid3, uid7, uid6], reposts: [uid1, uid7],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "Nunca había conectado esos conceptos. Este hilo debería estar en los libros de texto.", urlsMultimedia: [], meGusta: [uid10, uid7], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid3, contenido: "Esto me ayudó más que toda la clase de variables complejas del semestre.", urlsMultimedia: [], meGusta: [uid10], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p21, autorId: uid5, fechaCreacion: daysAgo(16),
        contenido: "Probé los mejores 10 restaurantes de Bogotá este mes para mi columna. El ganador sorpresivo: un pequeño lugar en La Candelaria con una bandeja paisa que supera a los grandes.",
        urlsMultimedia: ["https://media.correo.com/p21_bandeja.jpg", "https://media.correo.com/p21_restaurante.jpg"],
        etiquetas: ["gastronomia", "bogota", "restaurantes", "comidacolombiana", "critica"],
        meGusta: [uid2, uid4, uid6, uid8, uid9], reposts: [uid4, uid8],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid4, contenido: "Cuál es el nombre del restaurante? Voy el próximo fin de semana.", urlsMultimedia: [], meGusta: [uid5, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid8, contenido: "La bandeja paisa tiene un perfil nutricional increíble si se equilibra bien.", urlsMultimedia: [], meGusta: [uid5], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p22, autorId: uid2, fechaCreacion: daysAgo(17),
        contenido: "Adoptamos a Luna hoy. Tiene 3 años, estuvo 8 meses en el refugio. Ya eligió su rincón favorito del apartamento y robó mi almohada.",
        urlsMultimedia: ["https://media.correo.com/p22_luna1.jpg", "https://media.correo.com/p22_luna2.jpg"],
        etiquetas: ["adopcion", "mascotas", "perros", "luna", "amor"],
        meGusta: [uid1, uid3, uid4, uid5, uid6, uid7, uid9, uid10], reposts: [uid4, uid6, uid9],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 8,
        respuestas: [
            { _id: new ObjectId(), autorId: uid4, contenido: "Sus ojos lo dicen todo. Que sea muy feliz en su nuevo hogar.", urlsMultimedia: [], meGusta: [uid2, uid6], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid9, contenido: "Los perros rescatados son los más agradecidos. Luna tiene suerte.", urlsMultimedia: [], meGusta: [uid2], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p23, autorId: uid1, fechaCreacion: daysAgo(18),
        contenido: "Reflexión del lunes: aprendí más de mis proyectos fallidos que de los exitosos. El error que destruyó la base de datos de producción me enseñó más sobre backups que cualquier curso.",
        urlsMultimedia: [],
        etiquetas: ["programacion", "reflexion", "aprendizaje", "errores", "devlife"],
        meGusta: [uid2, uid3, uid7, uid10], reposts: [uid3, uid10],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid3, contenido: "Necesito escuchar esa historia del backup. Sonó traumática.", urlsMultimedia: [], meGusta: [uid1, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid10, contenido: "El fracaso calibrado es el mejor maestro. Gran reflexión.", urlsMultimedia: [], meGusta: [uid1], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p24, autorId: uid4, fechaCreacion: daysAgo(19),
        contenido: "Drone photos del desierto de La Tatacoa al atardecer. El contraste entre el rojo de la tierra y el cielo naranja es algo que la cámara casi no puede capturar.",
        urlsMultimedia: ["https://media.correo.com/p24_tatacoa1.jpg", "https://media.correo.com/p24_tatacoa2.jpg", "https://media.correo.com/p24_tatacoa3.jpg"],
        etiquetas: ["drone", "tatacoa", "colombia", "desierto", "fotografia"],
        meGusta: [uid1, uid2, uid3, uid5, uid6, uid7, uid9], reposts: [uid1, uid6, uid7],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 7,
        respuestas: [
            { _id: new ObjectId(), autorId: uid6, contenido: "La segunda foto parece pintura. Qué drone usas?", urlsMultimedia: [], meGusta: [uid4, uid1], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid2, contenido: "Colombia tiene paisajes que el mundo no conoce todavía.", urlsMultimedia: [], meGusta: [uid4], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p25, autorId: uid9, fechaCreacion: daysAgo(20),
        contenido: "Maratón completada: 42 km en 3 horas 47 minutos. Hace dos años no podía correr 5 km seguidos. Si estás empezando, solo corre. El ritmo llega solo.",
        urlsMultimedia: ["https://media.correo.com/p25_maraton_meta.jpg"],
        etiquetas: ["maraton", "running", "resistencia", "logro", "motivacion"],
        meGusta: [uid1, uid2, uid3, uid5, uid6, uid7, uid8, uid10], reposts: [uid2, uid5, uid8],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 8,
        respuestas: [
            { _id: new ObjectId(), autorId: uid8, contenido: "Ese tiempo es élite. Qué plan de hidratación seguiste durante la carrera?", urlsMultimedia: [], meGusta: [uid9, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid2, contenido: "Esto me da la motivación que necesitaba para inscribirme a mi primera 10K.", urlsMultimedia: [], meGusta: [uid9], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p26, autorId: uid3, fechaCreacion: daysAgo(21),
        contenido: "Simulé el sistema solar en Python con matplotlib. Cada planeta con su período orbital real. El código está en GitHub, link en bio.",
        urlsMultimedia: ["https://media.correo.com/p26_sistema_solar.gif"],
        etiquetas: ["python", "simulacion", "astronomia", "github", "ciencia"],
        meGusta: [uid1, uid6, uid7, uid10], reposts: [uid1, uid10],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 4,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "Usar matplotlib para animaciones es complicado. Buen trabajo.", urlsMultimedia: [], meGusta: [uid3, uid10], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid10, contenido: "Incluiste la precesión de mercurio en el modelo?", urlsMultimedia: [], meGusta: [uid3], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p27, autorId: uid8, fechaCreacion: daysAgo(22),
        contenido: "Receta de la semana: tacos de coliflor rostizada con salsa de aguacate y cilantro. 100% plant-based, listos en 25 minutos.",
        urlsMultimedia: ["https://media.correo.com/p27_tacos_coliflor.jpg"],
        etiquetas: ["vegano", "plantbased", "tacos", "receta", "nutricion"],
        meGusta: [uid2, uid4, uid5, uid6, uid9], reposts: [uid5, uid9],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid5, contenido: "La coliflor rostizada es un ingrediente subestimado. Buen uso.", urlsMultimedia: [], meGusta: [uid8, uid4], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid4, contenido: "La presentación tiene una luz espectacular. Dónde fotografías tus recetas?", urlsMultimedia: [], meGusta: [uid8], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p28, autorId: uid7, fechaCreacion: daysAgo(23),
        contenido: "Colaboración con un artista de jazz de Nueva York totalmente remota. Grabé la guitarra en Bogotá, él el saxofón en Brooklyn, lo mezclamos en la nube.",
        urlsMultimedia: ["https://media.correo.com/p28_collab_jazz.mp3"],
        etiquetas: ["jazz", "colaboracion", "musica", "remoto", "guitarra"],
        meGusta: [uid1, uid3, uid6, uid9, uid10], reposts: [uid6, uid10],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "La latencia al grabar remoto no fue un problema? Cuál plataforma usaron?", urlsMultimedia: [], meGusta: [uid7, uid3], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid6, contenido: "La mezcla de guitarra española y saxo tiene una vibra única.", urlsMultimedia: [], meGusta: [uid7], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p29, autorId: uid6, fechaCreacion: daysAgo(24),
        contenido: "Abro comisiones de arte digital por primera vez. Retratos, personajes y fanart. Precios accesibles, calidad garantizada. DM para detalles y lista de espera.",
        urlsMultimedia: ["https://media.correo.com/p29_comisiones_sheet.jpg"],
        etiquetas: ["comisiones", "artedigital", "retrato", "fanart", "arte"],
        meGusta: [uid3, uid4, uid7, uid9, uid10], reposts: [uid3, uid7, uid9],
        cantidadRespuestas: 2, cantidadReposts: 3, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid4, contenido: "Ya te mandé DM. Quiero un retrato de mi perro en estilo anime.", urlsMultimedia: [], meGusta: [uid6, uid2], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid3, contenido: "Cuánto tiempo tardas en promedio por comisión?", urlsMultimedia: [], meGusta: [uid6], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    },
    {
        _id: p30, autorId: uid10, fechaCreacion: daysAgo(25),
        contenido: "Paradoja del día: si un barbero afeita a todos los que no se afeitan a sí mismos, ¿quién afeita al barbero? Esta contradicción destruyó la teoría de conjuntos naive de Cantor en 1901.",
        urlsMultimedia: ["https://media.correo.com/p30_russell_paradox.jpg"],
        etiquetas: ["matematicas", "logica", "russell", "conjuntos", "filosofia"],
        meGusta: [uid1, uid3, uid6, uid7, uid9], reposts: [uid1, uid3],
        cantidadRespuestas: 2, cantidadReposts: 2, cantidadMeGusta: 5,
        respuestas: [
            { _id: new ObjectId(), autorId: uid1, contenido: "La paradoja de Russell. La primera vez que la escuché me quedé un rato en silencio.", urlsMultimedia: [], meGusta: [uid10, uid3], cantidadRespuestas: 0, cantidadMeGusta: 2 },
            { _id: new ObjectId(), autorId: uid7, contenido: "Y pensar que una pregunta tan simple demolió toda una teoría matemática.", urlsMultimedia: [], meGusta: [uid10], cantidadRespuestas: 0, cantidadMeGusta: 1 }
        ]
    }
]);

// Verificar resultados
db.usuarios.countDocuments();
db.publicaciones.countDocuments();
