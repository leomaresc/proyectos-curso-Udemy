const fs = require("fs")

fs.readFile('./message.txt', 'utf-8', (err, data) => {
    if (err) {
        console.log('File not found', err);
        return;
    }

    const lines = data.split('\n');

    if(lines.length >= 2){
        const secondLine = lines[1].trim();
        console.log(secondLine);
    } else{
        console.log('El archivo no tiene al menos dos lineas.')
    }
});