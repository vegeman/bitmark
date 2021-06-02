import { secretbox, randomBytes, box } from 'tweetnacl'
import {
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util'

const newNonce = () => randomBytes(secretbox.nonceLength)

export const generateKey = () => {
  const keyPair = box.keyPair()
  const publicKey = encodeBase64(keyPair.publicKey)
  const privateKey = encodeBase64(keyPair.secretKey)
  const encryptedPrivateKey = encrypt(privateKey, publicKey)
  return {
    publicKey,
    privateKey,
    encryptedPrivateKey
  }
}

export const encrypt = (message, key) => {
  // string message mean encoded key
  const messageUint8 = typeof message === 'string' ? decodeBase64(message) : message
  const keyUint8Array = decodeBase64(key)
  const nonce = newNonce()
  const box = secretbox(messageUint8, nonce, keyUint8Array)

  const fullMessage = new Uint8Array(nonce.length + box.length)
  fullMessage.set(nonce)
  fullMessage.set(box, nonce.length)

  const base64FullMessage = encodeBase64(fullMessage)
  return base64FullMessage
}

export const decrypt = (messageWithNonce, key) => {
  const keyUint8Array = decodeBase64(key)
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce)
  const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(
    secretbox.nonceLength,
    messageWithNonce.length
  )

  const decrypted = secretbox.open(message, nonce, keyUint8Array)

  if (!decrypted) {
    throw new Error('Could not decrypt message')
  }

  return decrypted
}
