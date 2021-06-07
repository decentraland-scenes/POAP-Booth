import { Dispenser } from './dispenser'

export let sceneMessageBus = new MessageBus();

let POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0, 0, 0),
  },
  "poapapi.dcl.guru",
  "2369"
);

sceneMessageBus.on("activatePoap", () => {
  POAPBooth.activate();
});

// Text above POAP Booth
poapText()
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

async function poapText() {
  let poapUrl = `https://poapapi.dcl.guru/event/${'2369'}`
          let presponse = await fetch(poapUrl)
          var poapjson = await presponse.json()

          let poapText = new Entity()
          poapText.addComponent(new Transform({
            position: new Vector3(8, 2.75, 8),
            rotation: Quaternion.Euler(0, -180, 0)
          }))
          let text = poapjson.data.name.replace(/-/g, '\n')
          poapText.addComponent(new TextShape(text))
          poapText.getComponent(TextShape).fontSize = 1;
          engine.addEntity(poapText)
}

