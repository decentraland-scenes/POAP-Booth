import { Dispenser } from './dispenser'

export let sceneMessageBus = new MessageBus()

let POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0, 0, 0),
  },
  'poapapi.dcl.guru',
  '5498',
  'DG Poap',
  1080,
  1080
)

sceneMessageBus.on('activatePoap', () => {
  POAPBooth.activate()
  log('activated')
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
