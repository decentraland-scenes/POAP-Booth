import { getUserData, UserData } from '@decentraland/Identity'
import * as eth from '../node_modules/eth-connect/esm'
import * as EthereumController from '@decentraland/EthereumController'
import { getProvider } from '@decentraland/web3-provider'
import poapContract from './abis/PoapDelegateMint'
import { sceneMessageBus } from './game'

export let ethController = EthereumController

const poapSignerAddress = '0xa4b4b7b9bbaf770af51f491f11f72cdfe253eb02'

let userData: UserData

type serverData = {
  signedCode: string
  event: string
  signer: string
}

async function fetchUserData() {
  const data = await getUserData()
  log(data.displayName)
  return data
}

export async function callAPI(user: string) {
  const url =
    'http://localhost:5001/non-dcl-experiments/us-central1/app/get-poap-code?playerid=' +
    user +
    '&code=2'
  try {
    let response = await fetch(url)
    let json: serverData = await response.json()
    log(json)
    return json
  } catch {
    log('error fetching from POAP handling server ', url)
  }
}

export async function makeTransaction() {
  let userId = '0xe2b6024873d218B2E83B462D3658D8D7C3f55a18'
  if (!userData) {
    userData = await fetchUserData()
    userId = userData.userId
  }
  if (!userData.hasConnectedWeb3) {
    log('no wallet')

    //return
  }
  let json: serverData = await callAPI(userId)
  let signature = json.signedCode
  let event = json.event
  let signer = json.signer

  const provider = await getProvider()
  const rm = new eth.RequestManager(provider)

  const poapTokenFactory = await new eth.ContractFactory(rm, poapContract)
  const PoapDelegatedMint = (await poapTokenFactory.at(
    //ropsten: '0x2f3c23b50396EcB55C73956B069CF04e493bdEf9'
    '0xAac2497174f2Ec4069A98375A67D798db8a05337'
  )) as any

  await PoapDelegatedMint.mintToken(event, userId, signature, {
    from: poapSignerAddress,
  }).then(sceneMessageBus.emit('activatePoap', {}))

  return
}
