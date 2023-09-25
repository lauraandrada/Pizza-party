const rootElement = document.querySelector("#root");
const homeButton = document.querySelector("#Home");
const menuButton = document.querySelector("#Menu");

menuButton.addEventListener("click", (event) => {
  window.location = "http://localhost:5500/pizza/list";
});
