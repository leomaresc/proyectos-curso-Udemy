import axios from "axios";
import cheerio from "cheerio";
import { response } from "express";

const url = "https://www.brainyquote.com/topics/motivational-quotes";

export function getQuote(){
    axios.get(url)
        .then((response) => {
            if (response.status === 200) {
                const $ = cheerio.load(response.data);
                let allQuotes = $("#qbc1 > div > a > div").each(function() {
                    $(this).innerHTML();
                });
                let randomQuoteSelector = Math.random() * allQuotes.length
                let selectedQuote = allQuotes[randomQuoteSelector]
                return selectedQuote;
            }
            else{
                console.error("Error en la solicitud de la página.")
            }
        })
        .catch((error) => {
            console.error('Error al hacer la solicitud HTTP:', error);
        });
}

export default function dayMessage(day){
    switch(day){
        case 0:
            return "Domingo!. " + getQuote();
        break;
        case 1:
            return "Lunes!";
        break;
        case 2:
            return "Martes!"  + getQuote();
        break;
        case 3:
            return "Miercoles!";
        break;
        case 4:
            return "Jueves!";
        break;
        case 5:
            return "Viernes!";
        break;
        case 6:
            return "Sabado!"
        break;
        default:
        break;
    }
}