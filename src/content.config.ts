// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const categoriaEnum = z.enum(['grupales', 'duelos', 'parejas', 'bebida', 'familiares']);
const alcoholEnum = z.enum(['con', 'sin', 'adaptable']);
const nivelEnum = z.enum(['suave', 'normal', 'picante']);

const juegos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/juegos' }),
  schema: z.object({
    nombre: z.string(),
    categoria: categoriaEnum,
    jugadores: z.object({
      minimo: z.number().int(),
      ideal: z.string(),
      maximo: z.number().int(),
      alSuperarMaximo: z.string(),
    }),
    materiales: z.string(),
    duracionEstimada: z.string(),
    intensidad: z.array(nivelEnum),
    intensidadEscala: z.boolean().default(false),
    alcohol: alcoholEnum,
    ocasiones: z.array(z.string()).default([]),
    reglas: z.array(z.string()).min(1),
    variantes: z.array(z.object({
      nombre: z.string(),
      descripcion: z.string(),
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
    bancoContenido: z.enum(['propio', 'compartido', 'ninguno']),
    bancoContenidoRef: z.string().optional(),
    tablaCartas: z.array(z.object({
      carta: z.string(),
      regla: z.string(),
    })).optional(),
  }),
});

const ocasiones = defineCollection({
  loader: file('./src/content/ocasiones.json'),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    icono: z.string(),
    keywordPilar: z.string(),
    juegosAncla: z.array(z.string()),
  }),
});

const categorias = defineCollection({
  loader: file('./src/content/categorias.json'),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    descripcion: z.string(),
  }),
});

const banco = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/banco' }),
  schema: z.discriminatedUnion('formato', [
    z.object({
      formato: z.literal('generico'),
      grupos: z.record(z.string(), z.array(z.string())),
    }),
    z.object({
      formato: z.literal('verdad-reto'),
      niveles: z.object({
        suave: z.object({ verdades: z.array(z.string()), retos: z.array(z.string()) }).optional(),
        normal: z.object({ verdades: z.array(z.string()), retos: z.array(z.string()) }).optional(),
        picante: z.object({ verdades: z.array(z.string()), retos: z.array(z.string()) }).optional(),
      }),
    }),
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