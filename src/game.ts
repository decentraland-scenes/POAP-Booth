import { Dispenser } from './booth/dispenser'

const POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0, 0, 0)
  },
  'poap-api.decentraland.org',
  'acd27e4b-24bd-4040-b715-c0e11e863fb0',
  'HP test'
)
