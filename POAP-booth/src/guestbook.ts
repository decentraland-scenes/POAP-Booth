import { openUI } from './ui'
import { userData, setUserData } from './poapHandler'

// external servers being used by the project - Please change these to your own if working on something else!
export let fireBaseServer =
  'https://us-central1-decentraland-events.cloudfunctions.net/app/'

// get player data

export class GuestBook extends Entity {
  eventName: string
  constructor(
    transform: TranformConstructorArgs,
    eventName: string

    //,sound: AudioClip
  ) {
    super()
    engine.addEntity(this)

    this.addComponent(new GLTFShape('models/guestbook/guestbook.glb'))
    this.addComponent(new Transform(transform))

    this.eventName = eventName

    this.addComponent(
      new OnPointerDown(
        () => {
          openUI(eventName)
          log('OPENED GUESTBOOK')
        },
        { hoverText: 'Open' }
      )
    )

    let guestBookBase = new Entity()
    guestBookBase.addComponent(new Transform())
    guestBookBase.addComponent(
      new GLTFShape('models/guestbook/guestbook_base.glb')
    )
    guestBookBase.setParent(this)
  }
}

// get latest scoreboard data from server
export async function getGuestBook(event: string) {
  try {
    let url = fireBaseServer + 'get-signatures/?event=' + event
    let response = await fetch(url)
    let json = await response.json()
    log(json)
    return json
  } catch (e) {
    log('error fetching scores from server ', e)
  }
}

// change data in scoreboard
export async function signGuestBook(event: string) {
  if (!userData) {
    await setUserData()
  }
  try {
    let url = fireBaseServer + 'add-signature/?event=' + event
    let body = JSON.stringify({
      id: (await userData).userId,
      name: (await userData).displayName,
    })
    log(body)
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    })
    return response.json()
  } catch (e) {
    log('error posting to server ', e)
  }
}
