import removeWww from './removeWww';

export default function (domain) {

  domain = removeWww(domain);
  if (!domain) return;

  const parts = domain.split('.');
  return parts.slice(parts.length > 2 ? 1 : 0).join('.')

}
