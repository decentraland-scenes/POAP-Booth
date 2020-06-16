//import { callAPI, makeTransaction } from './poapHandler'
import { Dispenser } from './dispenser'

export let sceneMessageBus = new MessageBus()

let POAPBooth = new Dispenser(new GLTFShape('models/POAP_dispenser.glb'), {
  position: new Vector3(8, 0, 8),
})

sceneMessageBus.on('activatePoap', () => {
  POAPBooth.activate()
})

// let POAPBooth = new Entity()
// POAPBooth.addComponent(new Transform()).position = new Vector3(8, 0, 8)
// POAPBooth.addComponent(new GLTFShape('models/dispenser.glb'))
// engine.addEntity(POAPBooth)

// POAPBooth.addComponent(
//   new OnPointerDown((e) => {
//     makeTransaction()
//   })
// )
