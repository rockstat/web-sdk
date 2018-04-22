/**
 * Makes base64 url safe
 * @param base64 {string}
 * @return {string}
 */
export default function es(base64) {

  return base64.toString('base64')
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '='
}
