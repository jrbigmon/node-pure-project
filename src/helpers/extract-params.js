export function extractParams(route, url) {
  const routeParts = route.split("/").filter(Boolean);
  const urlParts = url.split("/").filter(Boolean);

  if (routeParts.length !== urlParts.length) return null;

  const params = {};

  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const urlPart = urlParts[i];

    if (routePart.startsWith(":")) {
      const key = routePart.slice(1);
      params[key] = decodeURIComponent(urlPart);
    } else if (routePart !== urlPart) {
      return null;
    }
  }

  return params;
}
