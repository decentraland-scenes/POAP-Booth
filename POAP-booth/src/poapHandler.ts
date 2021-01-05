import { getUserData, UserData } from '@decentraland/Identity'
import { getCurrentRealm, Realm } from '@decentraland/EnvironmentAPI'
import * as EthereumController from '@decentraland/EthereumController'
import * as ui from '../node_modules/@dcl/ui-utils/index'
import { PlayCloseSound, PlayCoinSound, PlayOpenSound } from './sounds'

export let ethController = EthereumController

export let fireBaseServer =
  'https://us-central1-decentraland-events.cloudfunctions.net/app/'

export let userData: UserData
export let playerRealm: Realm

type eventData = {
  secret: string
  event_id: string
}

type signedEventData = {
  signed_message: string
  event_id: string
}

let qrHex: string

let secret: eventData

let signature: signedEventData

export async function fetchUserData() {
  const data = await getUserData()
  log(data.displayName)
  return data
}

export async function setUserData() {
  const data = await getUserData()
  log(data.displayName)
  userData = data
}

// fetch the player's realm
export async function setRealm() {
  let realm = await getCurrentRealm()
  log(`You are in the realm: ${JSON.stringify(realm.displayName)}`)
  playerRealm = realm
}

export async function handlePoap(eventName: string) {
  if (userData.hasConnectedWeb3) {
    let poap = await sendpoap(eventName)
    if (poap.success === true) {
      PlayCoinSound()
      let p = new ui.OkPrompt(
        "A POAP token for today's event will arrive to your account very soon!",
        () => {
          p.close()
          PlayCloseSound()
        },
        'Ok',
        true
      )
    } else {
      PlayOpenSound()
      let text = 'Something is wrong with the server, please try again later.'
      if (poap.error) {
        text = poap.error
      }
      let p = new ui.OkPrompt(
        text,
        () => {
          p.close()
          PlayCloseSound()
        },
        'Ok',
        true
      )
    }
  } else {
    PlayOpenSound()
    let p = new ui.OkPrompt(
      'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.',
      () => {
        p.close()
        PlayCloseSound()
      },
      'Ok',
      true
    )
  }
}

export async function sendpoap(eventName: string) {
  //if (TESTDATA_ENABLED && IN_PREVIEW) {
  // return
  //}

  if (!userData) {
    await setUserData()
  }
  if (!playerRealm) {
    await setRealm()
  }

  const url = fireBaseServer + 'send-poap'

  let body = JSON.stringify({
    id: userData.userId,
    stage: eventName,
    server: playerRealm.serverName,
    realm: playerRealm.layer,
  })

  log('sending req to: ', url)
  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    })
    let data = await response.json()
    log('Poap status: ', data)

    return data
  } catch {
    log('error fetching from token server ', url)
  }
}
