import bitmark from '../lib/bitmark.js'
import { generateKey, encrypt, decrypt } from '../lib/crypto.js'
import { encodeBase64, decodeUTF8, encodeUTF8 } from 'tweetnacl-util'

const file = {
  get(req, res) {
    const filePayload = decodeUTF8('Vege is here')
    console.log('filePayload-->', filePayload)

    // gen three key
    const keyPair = generateKey()
    console.log('keyPair-->', keyPair)

    // encrypt file by private key
    const encryptedFile = encrypt(filePayload, keyPair.privateKey)

    // pack envelope
    console.log('envelope-->', {
      publicKey: keyPair.publicKey,
      dataKey: keyPair.dataKey,
      encryptedFile
    })

    let decryptedfile

    try {
      // decrypt encrypted private key by public key
      const decryptedPrivateKey = decrypt(keyPair.dataKey, keyPair.publicKey)

      // decrypt encrypted by decrypted private key
      decryptedfile = decrypt(encryptedFile, encodeBase64(decryptedPrivateKey))
    } catch (e) {
      return res.status(403).send(bitmark.return('bad key', 403))
    }
    return res.send(bitmark.return(encodeUTF8(decryptedfile)))
  },
  encrypt(req, res) {
    const filePayload = decodeUTF8(req.body.file_64)
    console.log('filePayload-->', filePayload)

    // gen three key
    const keyPair = generateKey()
    console.log('keyPair-->', keyPair)

    // encrypt file by private key
    const encryptedFile = encrypt(filePayload, keyPair.privateKey)

    // pack envelope
    return res.send(bitmark.return({
      publicKey: keyPair.publicKey,
      dataKey: keyPair.dataKey,
      encryptedFile
    }))
  },
  decrypt(req, res) {
    let decryptedfile

    try {
      // decrypt encrypted private key by public key
      const decryptedPrivateKey = decrypt(req.body.dataKey, req.body.publicKey)

      // decrypt encrypted by decrypted private key
      decryptedfile = decrypt(req.body.encryptedFile, encodeBase64(decryptedPrivateKey))
    } catch (e) {
      return res.status(403).send(bitmark.return('bad key', 403))
    }
    return res.send(bitmark.return(encodeUTF8(decryptedfile)))
  }
}

module.exports = file
