// Testlar uchun: loyiha manba kodida import'lar kengaytmasiz yozilgan
// (Next.js bundler shuni tushunadi). Node'da ham ishlashi uchun ".js" qo'shamiz.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (
      err.code === "ERR_MODULE_NOT_FOUND" &&
      (specifier.startsWith(".") || specifier.startsWith("/"))
    ) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw err;
  }
}
