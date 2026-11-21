(() => {
  let preference;
  try {
    preference = localStorage.getItem("theme");
  } catch {
    // Use the system preference when storage is unavailable.
  }

  const dark = preference === "dark" ||
    (preference !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
})();
