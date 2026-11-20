/** Enlace de WhatsApp con mensaje precargado (D6). `numero`: solo dígitos con código de país. */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Enlace mailto con asunto opcional. */
export function enlaceCorreo(correo: string, asunto?: string): string {
  return asunto ? `mailto:${correo}?subject=${encodeURIComponent(asunto)}` : `mailto:${correo}`;
}

/** Extrae el id de un video de YouTube (watch, youtu.be, embed, shorts). */
export function idYouTube(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}
