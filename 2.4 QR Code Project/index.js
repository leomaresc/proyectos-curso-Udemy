/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from 'inquirer';
import qr from 'qr-image';
import * as fs from 'node:fs';

console.log('Hola, bienvenido al generador de QR');

const link = [
    {
        type: 'input',
        name: 'link',
        message: "Por favor, ingrese el link que desea convertir en codigo QR: \n"
    }
]

inquirer.prompt(link).then((answers) => {
    var qr_png = qr.image(answers.link, { type: 'png' });
    qr_png.pipe(fs.createWriteStream('i_love_qr.png'));
    console.log('Su archivo está listo.')
})