const TelegramBot = require('node-telegram-bot-api')
const { exec } = require('child_process')
const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const token = process.env.TOKEN
const YAPI_KEY = process.env.YAPI_KEY
const FOLDER_ID = process.env.FOLDER_ID

const bot = new TelegramBot(token, { polling: true })

bot.on('voice', async (msg) => {
  const stream = bot.getFileStream(msg.voice.file_id)
  let chunks = []

  stream.on('data', (chunk) => chunks.push(chunk))
  stream.on('end', () => {
    const axiosConfig = {
      method: 'POST',
      url: `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?folderId=${FOLDER_ID}&lang=auto`,
      headers: {
        Authorization: 'Api-Key ' + YAPI_KEY,
      },
      data: Buffer.concat(chunks),
    }

    axios(axiosConfig)
      .then((response) => {
        const command = response.data.result
        if (command === 'Выключай компьютер' || 'Turn off computer') {
          bot.sendMessage(msg.chat.id, 'Computer turning of soon...')
          exec('shutdown /s')
        }
      })
      .catch((error) => {
        console.log('Error', error)
      })
  })
})
