// src/content.config.ts
// Astro 7 — Content Layer API (loaders + astro/zod)
// Probado con astro@7.2.0 — `npm run build` sincroniza y valida sin errores.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// ---------- Enums compartidos ----------
const categoriaEnum = z.enum(['grupales', 'duelos', 'parejas', 'bebida', 'familiares']);
const alcoholEnum = z.enum(['con', 'sin', 'adaptable']);
const nivelEnum = z.enum(['suave', 'normal', 'picante']);

// ---------- Colección: juegos (34 fichas) ----------
// Un archivo .json por juego en src/content/juegos/. El nombre de archivo = slug = id.
const juegos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/juegos' }),
  schema: z.object({
    nombre: z.string(),
    categoria: categoriaEnum,
    jugadores: z.object({
      minimo: z.number().int(),
      ideal: z.string(),           // ej. "5-8" o "2" en Parejas
      maximo: z.number().int(),
      alSuperarMaximo: z.string(), // texto de la modificación de penitencia
    }),
    materiales: z.string(),
    duracionEstimada: z.string(),
    intensidad: z.array(nivelEnum),          // niveles que soporta el banco de ESTE juego
    intensidadEscala: z.boolean().default(false), // true = "Escala" (Preguntas Escalonadas), no son niveles seleccionables
    alcohol: alcoholEnum,
    ocasiones: z.array(z.string()).default([]),   // ids de la colección `ocasiones`
    reglas: z.array(z.string()).min(1),
    variantes: z.array(z.object({
      nombre: z.string().optional(), // no todas las variantes del catálogo tienen nombre corto propio
      descripcion: z.string(),
      // si la variante usa el banco de OTRO juego (ej. Duelo Relámpago "versión pareja" -> sincronia)
      bancoContenidoRef: z.string().optional(),
    })).default([]),
    disclaimer: z.boolean(),
    seo: z.object({
      titulo: z.string(),
      metaDescripcion: z.string(),
      keywordObjetivo: z.string(),
      preguntaAIOverview: z.string(),
    }),
    faq: z.array(z.object({
      pregunta: z.string(),
      respuesta: z.string(),
    })).min(2).max(3),
    // De dónde saca este juego su contenido de preguntas/retos (colección `banco`)
    bancoContenido: z.enum(['propio', 'compartido', 'ninguno']),
    bancoContenidoRef: z.string().optional(), // slug del juego dueño, solo si bancoContenido = "compartido"
    tablaCartas: z.array(z.object({    // campo especial, solo lo usa Rey de Copas
      carta: z.string(),
      regla: z.string(),
    })).optional(),
  }),
});

// ---------- Colección: ocasiones (6 pilares de navegación) ----------
const ocasiones = defineCollection({
  loader: file('./src/content/ocasiones.json'),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    icono: z.string(),                 // nombre de ícono Tabler, ej. "ti-cake"
    keywordPilar: z.string(),
    juegosAncla: z.array(z.string()),  // ids de la colección `juegos`
  }),
});

// ---------- Colección: categorias (5 categorías) ----------
const categorias = defineCollection({
  loader: file('./src/content/categorias.json'),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    descripcion: z.string(),
  }),
});

// ---------- Colección: banco (contenido real de preguntas/retos) ----------
// Un archivo .json por juego en src/content/banco/, mismo slug que en `juegos`
// cuando bancoContenido = "propio". Solo 3 formatos cubren los 34 juegos.
const banco = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/banco' }),
  schema: z.discriminatedUnion('formato', [
    // La mayoría de los juegos: listas de texto agrupadas por nivel de intensidad
    // O por categoría/mazo temático (Categorías Express, Charadas Temáticas, Trivia...)
    z.object({
      formato: z.literal('generico'),
      grupos: z.record(z.string(), z.array(z.string())),
    }),
    // Solo Verdad, Reto o Bebe: separa verdades y retos dentro de cada nivel
    z.object({
      formato: z.literal('verdad-reto'),
      niveles: z.object({
        suave: z.object({ verdades: z.array(z.string()), retos: z.array(z.string()) }).optional(),
        normal: z.object({ verdades: z.array(z.string()), retos: z.array(z.string()) }).optional(),
        picante: z.object({ verdades: z.array(z.string()), retos: z.array(z.string()) }).optional(),
      }),
    }),
    // Solo El Traductor: cada ítem es palabra + lista de términos prohibidos
    z.object({
      formato: z.literal('palabra-prohibidas'),
      grupos: z.record(z.string(), z.array(z.object({
        palabra: z.string(),
        prohibidas: z.array(z.string()),
      }))),
    }),
  ]),
});

export const collections = { juegos, ocasiones, categorias, banco };
