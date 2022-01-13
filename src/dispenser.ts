import * as utils from '@dcl/ecs-scene-utils'
import * as UI from '@dcl/ui-scene-utils'
import { sceneMessageBus } from './messageBus'

import { getUserData } from '@decentraland/Identity'
import { getCurrentRealm } from '@decentraland/EnvironmentAPI'
import { PlayCloseSound, PlayCoinSound } from './sounds'

export class Dispenser extends Entity {
  idleAnim = new AnimationState('Idle_POAP', { looping: true })
  buyAnim = new AnimationState('Action_POAP', { looping: false })
  buttonAnim = new AnimationState('Button_Action', { looping: false })
  eventName: string
  alreadyAttempted: boolean = false
  timeToClickable: number = 0
  UIdisplayName: string | null = null
  imageSizeX: number | null = 1024
  imageSizeY: number | null = 1024

  /**
   *
   * @param {TranformConstructorArgs} transform position, rotation and scale of the booth
   * @param {string} poapServer server to use
   * @param {string} eventName ID of the event, as provided by poap.xyz
   * @param {string} UIdisplayName (Optional) Name to display on UI when poap is claimed. By default it uses the name provided on poap.xyz
   * @param {number} [imageSizeX=1024] (Optional) Width of the POAP image associated with the event. By default 1024.
   * @param {number} [imageSizeY=1024]  (Optional) Height of the POAP image associated with the event. By default 1024.
   *
   */
  constructor(
    transform: TranformConstructorArgs,
    poapServer: string,
    eventName: string,
    UIdisplayName?: string,
    imageSizeX?: number,
    imageSizeY?: number
  ) {
    super()
    engine.addEntity(this)

    this.addComponent(new GLTFShape('models/poap/POAP_dispenser.glb'))
    this.addComponent(new Transform(transform))

    this.addComponent(new Animator())
    this.getComponent(Animator).addClip(this.idleAnim)
    this.getComponent(Animator).addClip(this.buyAnim)
    this.idleAnim.play()

    this.eventName = eventName

    let button = new Entity()
    button.addComponent(new GLTFShape('models/poap/POAP_button.glb'))
    button.addComponent(new Animator())
    button.getComponent(Animator).addClip(this.buttonAnim)
    button.setParent(this)
    button.addComponent(
      new OnPointerDown(
        (e) => {
          button.getComponent(Animator).getClip('Action').play()
          //sceneMessageBus.emit('activatePoap', {})
          this.makeTransaction(poapServer, eventName)
        },
        { hoverText: 'Get Attendance Token' }
      )
    )
    engine.addEntity(button)

    if (UIdisplayName) this.UIdisplayName = UIdisplayName
    if (imageSizeX) this.imageSizeX = imageSizeX
    if (imageSizeY) this.imageSizeY = imageSizeY

    return this
  }

  public activate(): void {
    let anim = this.getComponent(Animator)

    anim.getClip('Action_POAP').play()

    this.addComponentOrReplace(
      new utils.Delay(4000, () => {
        anim.getClip('Action_POAP').stop()

        anim.getClip('Idle_POAP').play()
      })
    )
  }

  async makeTransaction(poapServer: string, event: string) {
    const userData = await getUserData()

    // no wallet
    if (!userData || !userData.hasConnectedWeb3) {
      log('no wallet')
      PlayCloseSound()

      let mmPrompt = new UI.CustomPrompt()

      mmPrompt.addText(
        'A MetaMask Digital wallet\nis required to claim this token.',
        0,
        25,
        Color4.Black(),
        20
      )
      mmPrompt.addButton(
        'Get MetaMask',
        -100,
        -100,
        () => {
          openExternalURL('https://metamask.io/')
        },
        UI.ButtonStyles.RED
      )

      mmPrompt.addButton(
        'Cancel',
        100,
        -100,
        () => {
          PlayCloseSound()
          mmPrompt.hide()
        },
        UI.ButtonStyles.F
      )
      return
    }

    // already attempted
    if (this.alreadyAttempted) {
      PlayCloseSound()
      let prompt = new UI.CustomPrompt()
      prompt.addText('Already attempted', 0, 120, Color4.Red(), 24)

      prompt.addText(
        "You've already requested to\nclaim this POAP token.",
        0,
        50,
        Color4.Black(),
        22
      )

      prompt.addButton(
        'See my POAPs',
        -100,
        -100,
        () => {
          openExternalURL('https://app.poap.xyz')
        },
        UI.ButtonStyles.DARK
      )

      prompt.addButton(
        'Ok',
        100,
        -100,
        () => {
          prompt.hide()
          PlayCloseSound()
        },
        UI.ButtonStyles.E
      )

      return
    }
    this.alreadyAttempted = true

    const realm = await getCurrentRealm()

    const url = `https://${poapServer}/claim/${event}`
    let method = 'POST'
    let headers = { 'Content-Type': 'application/json' }
    let body = JSON.stringify({
      address: userData.publicKey,
      catalyst: realm.domain,
      room: realm.layer,
    })

    try {
      let response = await fetch(url, {
        headers: headers,
        method: method,
        body: body,
      })
      let data = await response.json()

      if (response.status == 200) {
        viewSuccessMessage(
          this.UIdisplayName ? this.UIdisplayName : data.event.name,
          data.event.image_url,
          this.imageSizeX,
          this.imageSizeY
        )

        sceneMessageBus.emit('activatePoap', {})
      } else {
        PlayCloseSound()
        UI.displayAnnouncement(`Oops, there was an error: "${data.error}"`, 3)
      }
    } catch {
      this.alreadyAttempted = false
      log('error fetching from POAP server ', url)
    }

    return
  }
}

function viewSuccessMessage(
  poapName: string,
  image: string,
  imageSizeX: number,
  imageSizeY: number
) {
  PlayCoinSound()
  let thumbTexture = new Texture(image, { hasAlpha: true })

  let name = new UIText(UI.canvas)
  name.value = poapName
  name.color = Color4.Yellow()
  name.outlineColor = Color4.Black()
  name.outlineWidth = 0.1
  name.positionY = -85
  name.visible = true
  name.fontSize = 30
  name.hTextAlign = 'center'
  name.hAlign = 'center'

  let thumb = new UIImage(UI.canvas, thumbTexture)
  thumb.hAlign = 'center'
  thumb.vAlign = 'center'
  thumb.positionY = 90
  thumb.width = 256
  thumb.height = 256
  thumb.sourceLeft = 0
  thumb.sourceTop = 0
  thumb.sourceHeight = imageSizeY
  thumb.sourceWidth = imageSizeX
  thumb.visible = true

  let note = new UIText(UI.canvas)
  note.value = 'This POAP token is being sent to your wallet'
  note.color = Color4.Black()
  note.positionY = -128
  note.visible = true
  note.fontSize = 30
  note.hTextAlign = 'center'
  note.hAlign = 'center'

  utils.setTimeout(7000, () => {
    name.visible = false
    thumb.visible = false
    note.visible = false
  })
}
