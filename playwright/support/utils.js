// Função para gerar um ULID dinâmico (JavaScript puro)
export function gerarULID() {
  const alfabeto = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Base32 Crockford
  const tempo = Date.now(); // Timestamp em milissegundos
  const tempoBits = tempo.toString(2).padStart(48, '0'); // 48 bits

  // Gera 80 bits aleatórios
  let aleatorioBits = '';
  for (let i = 0; i < 80; i++) {
    aleatorioBits += Math.floor(Math.random() * 2);
  }

  // Concatena timestamp + aleatório (total 128 bits)
  const ulidBits = tempoBits + aleatorioBits;

  // Divide em grupos de 5 bits e converte para Base32
  let ulid = '';
  for (let i = 0; i < 26; i++) {
    const segmento = ulidBits.slice(i * 5, i * 5 + 5);
    const indice = parseInt(segmento, 2);
    ulid += alfabeto[indice];
  }

  return ulid;
}