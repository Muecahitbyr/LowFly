// Leitet www.fahrschule-low-fly.de dauerhaft (301) auf die Adresse ohne www um,
// alles andere liefert die statischen Dateien aus dist/ aus.
const CANONICAL_HOST = 'fahrschule-low-fly.de';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
