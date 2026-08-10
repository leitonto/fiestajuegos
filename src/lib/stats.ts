// src/lib/stats.ts
import { getCollection } from 'astro:content';

type BancoEntry = Awaited<ReturnType<typeof getCollection<'banco'>>>[number];

function contarItemsBanco(entry: BancoEntry): number {
  const data = entry.data;

  if (data.formato === 'verdad-reto') {
    return Object.values(data.niveles).reduce((acc, nivel) => {
      if (!nivel) return acc;
      return acc + nivel.verdades.length + nivel.retos.length;
    }, 0);
  }

  if (data.formato === 'palabra-prohibidas') {
    return Object.values(data.grupos).reduce((acc, lista) => acc + lista.length, 0);
  }

  return Object.values(data.grupos).reduce((acc, lista) => acc + lista.length, 0);
}

export async function getStats() {
  const juegos = await getCollection('juegos');
  const banco = await getCollection('banco');
  const retos = banco.reduce((acc, entry) => acc + contarItemsBanco(entry), 0);

  return {
    juegos: juegos.length,
    retos,
    articulos: null as number | null,
  };
}