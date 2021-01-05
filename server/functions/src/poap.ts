require('isomorphic-fetch')

export type eventData = {
  secret: string
  event_id: string
}
export type signedEventData = {
  signed_message: string
  event_id: string
}

export async function getSecret(qrHex: string) {
  const url = 'https://api.poap.xyz/actions/claim-qr?qr_hash=' + qrHex
  try {
    let response = await fetch(url)
    let data = await response.json()
    let json: eventData = { secret: data.secret, event_id: data.event_id }
    console.log('secret :', json)
    return json
  } catch {
    console.log('error fetching from POAP server ', url)
    return {
      secret: '',
      event_id: '',
    }
  }
}
export async function getPoap(id: string, data: eventData, qrHex: string) {
  const url = 'https://api.poap.xyz/actions/claim-qr'
  let method = 'POST'
  let headers = { 'Content-Type': 'application/json' }
  let body = JSON.stringify({
    address: id,
    qr_hash: qrHex,
    secret: data.secret,
  })
  console.log('sending ', body)
  try {
    let response = await fetch(url, {
      headers: headers,
      method: method,
      body: body,
    })
    let data = await response.json()
    let json: signedEventData = {
      signed_message: data.delegated_signed_message,
      event_id: data.event_id,
    }
    return json
  } catch {
    console.log('error fetching from POAP server ', url)
    return {
      signed_message: '',
      event_id: '',
    }
  }
}
