export default function() {

  const w = window;
  const d = w.document;
  const l = w.location;

  return {
    path: l.pathname,
    hostname: l.hostname,
    referrer: d.referrer,
    query: l.search,
    title: d.title,
    url: l.href,
    hash: l.hash
  };
}
