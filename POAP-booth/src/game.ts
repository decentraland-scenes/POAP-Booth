//import { callAPI, makeTransaction } from './poapHandler'
import { Dispenser } from './dispenser'
import { GuestBook } from './guestbook'

export let sceneMessageBus = new MessageBus()

let POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
  },
  'test'
)

sceneMessageBus.on('activatePoap', () => {
  POAPBooth.activate()
})

let POAPBanner = new Entity()
POAPBanner.addComponent(new Transform()).position = new Vector3(6, 0, 8)
POAPBanner.addComponent(new GLTFShape('models/poap/POAP_Banner.glb'))
engine.addEntity(POAPBanner)

POAPBanner.addComponent(
  new OnPointerDown(
    (e) => {
      openExternalURL('https://www.poap.xyz/')
    },
    { hoverText: 'Learn More' }
  )
)

let guestBook = new GuestBook(
  {
    position: new Vector3(10, 0, 6),
  },
  'test'
)
