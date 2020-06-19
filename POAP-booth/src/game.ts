//import { callAPI, makeTransaction } from './poapHandler'
import { Dispenser } from './dispenser'
import { GuestBook } from './guestbook'

// GUESTBOOK

let guestBook = new GuestBook(
  {
    position: new Vector3(10, 0, 6),
  },
  'test'
)

// POAP BOOTH

let POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
  },
  'genesis'
)

// MAKE POAP BOOTH MULTIPLAYER

export let sceneMessageBus = new MessageBus()

sceneMessageBus.on('activatePoap', () => {
  POAPBooth.activate()
})

// POAP BANNER

let POAPBanner = new Entity()
POAPBanner.addComponent(
  new Transform({
    position: new Vector3(6, 0, 8),
  })
)
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

// FLOOR

const entity = new Entity('entity')
engine.addEntity(entity)
entity.addComponentOrReplace(
  new GLTFShape('models/FloorBaseGrass_01/FloorBaseGrass_01.glb')
)
entity.addComponentOrReplace(
  new Transform({
    position: new Vector3(8, 0, 8),
    rotation: new Quaternion(0, 0, 0, 1),
    scale: new Vector3(1, 1, 1),
  })
)
