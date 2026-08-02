/**
 * router.js
 * Minimal hash-based router. Each route maps to an async render function
 * with signature (outlet, navigate, params) => void | cleanupFn. Handles
 * smooth page transitions and calls the previous page's cleanup function
 * (if any) before mounting the next one — important for Studio/Play, which
 * own a Babylon engine that must be disposed on navigation.
 */

export class Router {
  /**
   * @param {HTMLElement} outlet
   * @param {Record<string, Function>} routes route name -> render function
   * @param {(route: string) => void} onRouteChange called after each navigation (e.g. to update nav highlighting)
   */
  constructor(outlet, routes, onRouteChange) {
    this.outlet = outlet;
    this.routes = routes;
    this.onRouteChange = onRouteChange;
    this._cleanup = null;
    this.currentRoute = null;

    window.addEventListener("hashchange", () => this._handleHashChange());
  }

  /** Parses the current location.hash into { route, params }. */
  _parseHash() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    const [route, queryString] = hash.split("?");
    const params = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((value, key) => (params[key] = value));
    }
    return { route: route || "home", params };
  }

  _handleHashChange() {
    const { route, params } = this._parseHash();
    this._render(route, params);
  }

  /** Navigates to a route, updating the URL hash. */
  navigate(route, params = {}) {
    const query = new URLSearchParams(params).toString();
    window.location.hash = query ? `${route}?${query}` : route;
    // If the hash didn't actually change (same route re-clicked), force a render.
    const { route: current } = this._parseHash();
    if (current === route) this._render(route, params);
  }

  /** Starts the router by rendering whatever route is currently in the URL. */
  start() {
    const { route, params } = this._parseHash();
    this._render(route, params);
  }

  async _render(route, params) {
    const renderFn = this.routes[route] || this.routes.home;

    if (typeof this._cleanup === "function") {
      this._cleanup();
      this._cleanup = null;
    }

    this.outlet.classList.remove("page-enter");
    void this.outlet.offsetWidth; // restart animation
    this.outlet.classList.add("page-enter");

    this.currentRoute = route;
    if (this.onRouteChange) this.onRouteChange(route);

    const result = await renderFn(this.outlet, (r, p) => this.navigate(r, p), params);
    if (typeof result === "function") this._cleanup = result;
  }
}
