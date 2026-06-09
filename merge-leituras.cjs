const fs = require('fs');

const mdContent = fs.readFileSync('./PAROUSIA/reoteiro de leitura.md', 'utf-8');
const sermoesStr = fs.readFileSync('./src/data/sermoes.json', 'utf-8');
let sermoes = JSON.parse(sermoesStr);

const weeksData = {};
const sections = mdContent.split('#### Semana ');

for (let i = 1; i < sections.length; i++) {
  const section = sections[i];
  
  // Extract number
  const numMatch = section.match(/^(\d+)/);
  if (!numMatch) continue;
  const num = numMatch[1].padStart(2, '0');
  
  // Extract Tema
  const temaMatch = section.match(/\* \*\*Tema da semana:\*\* (.*)/);
  const tema = temaMatch ? temaMatch[1].trim() : '';

  // Extract Leituras
  const leituras = [];
  const lines = section.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('* **') && line.includes('—')) {
      // Don't match the 'Sermão', 'Texto', 'Tema'
      if (!line.includes('**Sermão:**') && !line.includes('**Texto do sermão:**') && !line.includes('**Tema da semana:**')) {
        const diaMatch = line.match(/\* \*\*(.*?):\*\* (.*?) — (.*)/);
        if (diaMatch) {
          leituras.push({
            dia: diaMatch[1].trim(),
            texto: diaMatch[2].trim(),
            descricao: diaMatch[3].trim()
          });
        }
      }
    }
  }

  weeksData[num] = {
    tema: tema,
    dias: leituras
  };
}

sermoes = sermoes.map(s => {
  if (weeksData[s.numero]) {
    s.leituras = weeksData[s.numero];
  }
  return s;
});

fs.writeFileSync('./src/data/sermoes.json', JSON.stringify(sermoes, null, 2), 'utf-8');
console.log('Processed weeks:', Object.keys(weeksData).length);
