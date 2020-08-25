const TelegramBot = require('node-telegram-bot-api');
const token = '1226623285:AAHJgOThOeM0KvoJM0BW82r41ANpwi-D-5k';
const bot = new TelegramBot(token, { polling: true });
const axios = require('axios')
const current_user = require('./current_user.json')
const fs = require('fs')

const options = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: '2gis', callback_data: '2gis' }],
            [{ text: 'yandex', callback_data: 'yandex' }],
            [{ text: '2gis and  yandex', callback_data: '2gis_yandex' }]
        ]
    })
};


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
        }).catch(e => { console.log(e.message) })
    }
    bot.sendMessage(chatId, 'Ваше фото сохранено');
});

bot.on('document', async (msg) => {

    const chatId = msg.chat.id;
    const { file_id: fileId } = msg.document;
    const fileUrl = await bot.getFileLink(fileId);
    const response = await axios.get(fileUrl);
    let messageError = ""
    let ok = false
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

        if (building_addreg_id && geonim && city && geonimtype && number)
            ok = true
        else
            ok = false

    })
    if (ok) {
        bot.sendMessage(chatId, "Buttons", options)
    }
    else
        bot.sendMessage(chatId, messageError);


});


bot.on('document', (msg) => {
    console.log(msg.document['file_id']);
    current_user[`${msg.chat.id}`] = {}
    current_user[`${msg.chat.id}`].file_id = msg.document['file_id']
    current_user[`${msg.chat.id}`].chat_id = msg.chat.id
    current_user[`${msg.chat.id}`].asd = "ASD"

    fs.writeFile('./current_user.json', JSON.stringify(current_user), function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(current_user));
        console.log('writing to ' + './current_user.json');
    });
})

bot.on('document', async (msg) => {
    await bot.downloadFile(msg.document['file_id'], "./files").then(function (path) {
        console.log(path);
    }).catch(e => { console.log(e.message) })
})



bot.on("callback_query", async function (msg) {
    if (msg.data == "2gis") {
        bot.sendMessage(msg.message.chat.id, "2GIS");
        bot.sendDocument(msg.message.chat.id,current_user[`${msg.message.chat.id}`].file_id)
    }
    if (msg.data == "yandex") {
        bot.sendMessage(msg.message.chat.id, "YANDEX");
        bot.getFileLink(current_user[`${msg.message.chat.id}`].file_id).then(async(path)=>{
            console.log("AAA", path);
            path = path.split('/')
            let my_change_file = require(`./files/${path[path.length-1]}`)
            my_change_file.push({"Changes": "my change"})
            ff = `./files/${path[path.length-1]}`
            await fs.writeFile(`./files/${path[path.length-1]}`, JSON.stringify(my_change_file), async function writeJSON(err) {
                if (err) return console.log(err);
                console.log(JSON.stringify(my_change_file));
                console.log('writing to ' + `./files/${path[path.length-1]}`);
            });

        })
    }
    if (msg.data == "2gis_yandex") {
        bot.sendMessage(msg.message.chat.id, "2GIS_YANDEX");
        bot.sendDocument(msg.message.chat.id,current_user[`${msg.message.chat.id}`].file_id)
    }
})



// xpath
// try, catch, error handler
// https://2gis.kz/almaty/search/