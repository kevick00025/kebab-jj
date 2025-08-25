// Funzioni per gestire il salvataggio e recupero dell'immagine canvas tra pagine

export function saveCanvasImage(dataUrl: string) {
  try {
    localStorage.setItem('coupon_canvas_image', dataUrl);
  } catch {}
}

export function getCanvasImage(): string | null {
  try {
    return localStorage.getItem('coupon_canvas_image');
  } catch {
    return null;
  }
}

export function clearCanvasImage() {
  try {
    localStorage.removeItem('coupon_canvas_image');
  } catch {}
}
