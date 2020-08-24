const TelegramBot = require('node-telegram-bot-api');
const token = '1226623285:AAHJgOThOeM0KvoJM0BW82r41ANpwi-D-5k';
const bot = new TelegramBot(token, { polling: true });
const axios = require('axios')

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

bot.on('text', async (msg, match) => {
    const chatId = msg.chat.id;
    console.log(match);
    bot.sendMessage(chatId, 'Ваше сообщение принято');
});

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.photo && msg.photo[0]) {
        await bot.downloadFile(msg.photo[msg.photo.length - 1].file_id, "./images").then(function (path) {
            console.log(path);
        }).catch(e=>{console.log(e.message)})
    }
    bot.sendMessage(chatId, 'Ваше фото сохранено');
});

bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const { file_id: fileId } = msg.document;
    const fileUrl = await bot.getFileLink(fileId);
    const response = await axios.get(fileUrl);
    let messageError = ""
    response.data.map((element, key) => {
        const status = { building_addreg_id: false, geonim: false, city: false, geonimtype: false, number: false }
        Object.keys(element).map(checkKey => {

            if (checkKey === 'building_addreg_id')
                status.building_addreg_id = true
            else if (checkKey === 'geonim')
                status.geonim = true
            else if (checkKey === 'city')
                status.city = true
            else if (checkKey === 'geonimtype')
                status.geonimtype = true
            else if (checkKey === 'number')
                status.number = true

        })

        const { building_addreg_id, geonim, city, geonimtype, number } = status
        if (!building_addreg_id)
            messageError += "ERROR on line " + (key + 1) + " building_addreg_id not found \n"
        if (!geonim)
            messageError += "ERROR on line " + (key + 1) + " geonim not found \n"
        if (!city)
            messageError += "ERROR on line " + (key + 1) + " city not found \n"
        if (!geonimtype)
            messageError += "ERROR on line " + (key + 1) + " geonimtype not found \n"
        if (!number)
            messageError += "ERROR on line " + (key + 1) + " number not found \n"

    })

    bot.sendMessage(chatId, messageError);
});


// xpath
// try, catch, error handler