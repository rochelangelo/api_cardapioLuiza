export function format(numero) {
  const formatter = new Intl.NumberFormat('pt-br')
  return formatter.format(numero);
}