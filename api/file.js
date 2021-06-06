import bitmark from '../lib/bitmark.js'
import crypto from '../lib/crypto.js'
import mongo from '../lib/mongo.js'
import logger from '../lib/logger.js'
import { encodeBase64 } from 'tweetnacl-util'

let lazyIdCounter = 0

const file = {
  get(req, res) {
    res.send()
  },
  // mocking client side file and key encryption
  async encrypt(req, res) {
    if (!req.body.senderUser) return res.status(400).send(bitmark.return('Lack of sender', 400))
    if (!req.body.recipientUser) return res.status(400).send(bitmark.return('Lack of recipient', 400))
    if (!req.body.file64) return res.status(400).send(bitmark.return('Lack of file', 400))
    if (!req.body.senderSecrectKey) return res.status(400).send(bitmark.return('Lack of key', 400))

    // query user public key
    const senderData = mongo.get_user(req.body.senderUser)
    const recipientData = mongo.get_user(req.body.recipientUser)
    if (!senderData) return res.status(400).send(bitmark.return('Sender user is not exist', 400))
    if (!recipientData) return res.status(400).send(bitmark.return('Recipient user is not exist', 400))

    // verify key pair
    if (!crypto.key.matchVerify(senderData.publicKey, req.body.senderSecrectKey)) return res.status(400).send(bitmark.return('Unmatched key pair', 400))

    // encrypt file, generate file key and header
    const { encryptedFile, header, fileKey } = await crypto.file.encrypt(req.body.file64)
    const encryptedFileKey = crypto.key.encrypt(recipientData.publicKey, fileKey, req.body.senderSecrectKey)

    // [Server side] store envelope data
    lazyIdCounter++
    mongo.post_envelope({
      id: lazyIdCounter,
      sender: senderData.user_name,
      recipient: recipientData.user_name,
      header: encodeBase64(header),
      envelope: {
        encryptedFileKey,
        encryptedFile: encodeBase64(encryptedFile)
      },
      last_encrypted_date: new Date()
    })

    // pack envelope
    return res.send(bitmark.return({
      envelopeId: lazyIdCounter
    }))
  },
  async decrypt(req, res) {
    if (!req.body.envelopeId) return res.status(400).send(bitmark.return('Lack of envelope id', 400))
    if (!req.body.recipientUser) return res.status(400).send(bitmark.return('Lack of recipient', 400))
    if (!req.body.recipientSecrectKey) return res.status(400).send(bitmark.return('Lack of key', 400))
    let decryptedFile

    // query envelope data
    const envelopeData = mongo.get_envelope(req.body.envelopeId)
    if (!envelopeData) return res.status(400).send(bitmark.return('Data is not exist', 400))
    if (envelopeData.recipient !== req.body.recipientUser) return res.status(400).send(bitmark.return('Bad request', 400))
    const senderData = mongo.get_user(envelopeData.sender)

    try {
      // decrypt file key then file
      const decryptedFileKey = crypto.key.decrypt(senderData.publicKey, envelopeData.envelope.encryptedFileKey, req.body.recipientSecrectKey)
      decryptedFile = await crypto.file.decrypt(envelopeData.envelope.encryptedFile, envelopeData.header, decryptedFileKey)
    } catch (e) {
      // logger.error(e)
      return res.status(403).send(bitmark.return('Bad key', 403))
    }

    mongo.post_envelope({
      ...envelopeData,
      last_decrypted_date: new Date()
    })

    return res.send(bitmark.return({
      file64: decryptedFile
    }))
  }
}

module.exports = file
