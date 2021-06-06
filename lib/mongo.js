const users = [
  {
    user_name: 'sender',
    publicKey: '8MuUngp5lf/829YabAeOmZYoZ03T23T6o17wwxPMOXw='
  },
  {
    user_name: 'recipient',
    publicKey: 'gZhRKD941ctf1jq63y4u0kw1W4HCISmtCymeFGg/h3U='
  }
]

const envelope = [{
  id: 'Number',
  sender: 'String',
  recipient: 'String',
  header: 'String',
  envelope: {
    encryptedFileKey: 'String',
    encryptedFile: 'String'
  },
  last_encrypted_date: 'Date',
  last_decrypted_date: 'Date'
}]

const mongo = {
  get_user(user_name) {
    return users.find(e => e.user_name === user_name)
  },
  get_envelope(id) {
    return envelope.find(e => e.id === id)
  },
  post_envelope(data) {
    const envelopeIndex = envelope.findIndex(e => e.id === data.id)
    if (envelopeIndex === -1) {
      envelope.push(data)
    } else {
      envelope[envelopeIndex] = data
    }
  }
}

module.exports = mongo
