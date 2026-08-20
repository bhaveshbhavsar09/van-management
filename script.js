// Simple script to show updates in console
document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("change", () => {
    console.log(`${el.id} updated to: ${el.value}`);
  });
});
