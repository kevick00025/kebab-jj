// Funzioni per salvare e recuperare lo stato del designer tra pagine
export function saveDesignerState(state, elements) {
  try {
    localStorage.setItem('coupon_designer_state', JSON.stringify({ state, elements }));
  } catch {}
}
export function getDesignerState() {
  try {
    const raw = localStorage.getItem('coupon_designer_state');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function clearDesignerState() {
  try {
    localStorage.removeItem('coupon_designer_state');
  } catch {}
}
