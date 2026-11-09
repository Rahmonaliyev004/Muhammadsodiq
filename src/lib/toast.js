// Oddiy xabarnoma tizimi: `alert()` o'rniga. Istalgan joydan chaqiriladi,
// <ToastHost /> (index.js da bir marta) ularni ekranda ko'rsatadi.
function emit(type, message) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("santexnik:toast", { detail: { type, message } }));
}

export const toast = {
  success: (message) => emit("success", message),
  error: (message) => emit("error", message),
  info: (message) => emit("info", message),
};
