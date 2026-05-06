import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import qrcode from "qrcode-terminal"
import axios from "axios"

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("./auth")
  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  // In QR code ra Logs
  sock.ev.on("connection.update", ({ qr }) => {
    if (qr) {
      console.log("QR RECEIVED")
      qrcode.generate(qr, { small: true })
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    if (!text) return

    // Gửi text sang n8n
    const reply = await axios.post(process.env.N8N_WEBHOOK, {
      from,
      text
    })

    const answer = reply.data.answer || "Xin lỗi, tôi không hiểu yêu cầu."

    await sock.sendMessage(from, { text: answer })
  })
}

start()
