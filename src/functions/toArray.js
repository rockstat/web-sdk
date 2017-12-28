export default function toArray(list) {

  if(!list) return;
  return Array.prototype.slice.call(list);

}
