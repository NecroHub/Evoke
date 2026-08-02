/**
 * NavRail.js
 * Renders the left-side primary navigation and wires clicks to the router.
 * Highlights the active route using the "Arc" signature treatment (see
 * .nav-item.active in components.css).
 */

const NAV_ITEMS = [
  { route: "home", label: "Home", icon: "⌂" },
  { route: "discover", label: "Discover", icon: "⊚" },
  { route: "my-games", label: "My Games", icon: "▤" },
  { route: "profile", label: "Profile", icon: "☺" },
  { route: "settings", label: "Settings", icon: "⚙" },
];

/**
 * Mounts nav items into #nav-links and returns an update function to
 * reflect the currently active route.
 * @param {(route: string) => void} navigate
 * @returns {(activeRoute: string) => void} setActive
 */
export function mountNavRail(navigate) {
  const container = document.getElementById("nav-links");
  container.innerHTML = "";

  const buttons = NAV_ITEMS.map((item) => {
    const btn = document.createElement("button");
    btn.className = "nav-item";
    btn.dataset.route = item.route;
    btn.innerHTML = `<span aria-hidden="true">${item.icon}</span><span class="tooltip">${item.label}</span>`;
    btn.setAttribute("aria-label", item.label);
    btn.addEventListener("click", () => navigate(item.route));
    container.appendChild(btn);
    return btn;
  });

  return function setActive(activeRoute) {
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === activeRoute);
    });
  };
}
