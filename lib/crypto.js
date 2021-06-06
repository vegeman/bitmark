import _sodium from 'libsodium-wrappers'
import { sign, randomBytes, box } from 'tweetnacl'
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util'

const newNonce = () => randomBytes(box.nonceLength)

const crypto = {
  file: {
    async encrypt(filePayload = 'message V') {
      await _sodium.ready
      const sodium = _sodium

      const fileKey = sodium.crypto_secretstream_xchacha20poly1305_keygen()
      const res = sodium.crypto_secretstream_xchacha20poly1305_init_push(fileKey)
      const [state_out, header] = [res.state, res.header]
      const encryptedFile = sodium.crypto_secretstream_xchacha20poly1305_push(state_out,
        sodium.from_string(filePayload), null,
        sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE)

      return { encryptedFile, header, fileKey }
    },
    async decrypt(encryptedFile, header, fileKey) {
      await _sodium.ready
      const sodium = _sodium
      const state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(decodeBase64(header), fileKey)
      const r1 = sodium.crypto_secretstream_xchacha20poly1305_pull(state_in, decodeBase64(encryptedFile))
      const [decryptedFile, tag1] = [sodium.to_string(r1.message), r1.tag]
      return decryptedFile
    }
  },
  key: {
    generate() {
      return box.keyPair()
    },
    matchVerify(publicKey, secretKey) {
      const keyPairFromSk = box.keyPair.fromSecretKey(decodeBase64(secretKey))
      return (encodeBase64(keyPairFromSk.publicKey) === publicKey)
    },
    encrypt(publicKey, fileKey, secretKey) {
      const keyPair = box.before(decodeBase64(publicKey), decodeBase64(secretKey))
      const nonce = newNonce()
      const messageUint8 = fileKey
      const encrypted = box.after(messageUint8, nonce, keyPair)

      const fullMessage = new Uint8Array(nonce.length + encrypted.length)
      fullMessage.set(nonce)
      fullMessage.set(encrypted, nonce.length)

      const base64FullMessage = encodeBase64(fullMessage)
      return base64FullMessage
    },
    decrypt(publicKey, messageWithNonce, secretKey) {
      const keyPair = box.before(decodeBase64(publicKey), decodeBase64(secretKey))
      const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce)
      const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength)
      const message = messageWithNonceAsUint8Array.slice(
        box.nonceLength,
        messageWithNonce.length
      )

      const decrypted = box.open.after(message, nonce, keyPair)

      if (!decrypted) {
        throw new Error('Could not decrypt message')
      }

      return decrypted
    }
  }
}

module.exports = crypto
