import * as utils from '@dcl/ecs-scene-utils'
import * as UI from '@dcl/ui-scene-utils'
import * as boothUI from './ui'

import { getUserData, UserData } from '@decentraland/Identity'
import { getCurrentRealm, Realm } from '@decentraland/EnvironmentAPI'
import { PlayCloseSound } from './sounds'
import { signedFetch } from '@decentraland/SignedFetch'

export const sceneMessageBus = new MessageBus()

export class Dispenser extends Entity {
  eventUUID: string
  alreadyAttempted: boolean = false
  timeToClickable: number = 0
  //   UIdisplayName: string | null = null
  serverURL: string

  /**
   *
   * @param {TranformConstructorArgs} transform position, rotation and scale of the booth
   * @param {string} poapServer server to use
   * @param {string} eventUUID ID of the event
   * @param {string} UIdisplayName (Optional) Name to display on UI when poap is claimed. By default it uses the name provided on poap.xyz
   *
   */
  constructor(
    transform: TranformConstructorArgs,
    eventUUID: string,
    // UIdisplayName?: string,
    poapServer?: string
  ) {
    super()
    engine.addEntity(this)
    this.serverURL = poapServer ? poapServer : 'poap-api.decentraland.org'
    this.eventUUID = eventUUID

    this.addComponent(new GLTFShape('models/poap/POAP_dispenser.glb'))
    this.addComponent(new Transform(transform))

    const idleAnim = new AnimationState('Idle_POAP', { looping: true })
    this.addComponent(new Animator())
    this.getComponent(Animator).addClip(idleAnim)
    this.getComponent(Animator).addClip(
      new AnimationState('Action_POAP', { looping: false })
    )
    idleAnim.play()

    const button = new Entity()
    button.addComponent(new GLTFShape('models/poap/POAP_button.glb'))
    button.addComponent(new Animator())
    button
      .getComponent(Animator)
      .addClip(new AnimationState('Button_Action', { looping: false }))
    button.setParent(this)
    button.addComponent(
      new OnPointerDown(
        (e) => {
          button.getComponent(Animator).getClip('Button_Action').play()
          //sceneMessageBus.emit('activatePoap', {})
          void this.makeTransaction()
        },
        { hoverText: 'Get Attendance Token' }
      )
    )
    engine.addEntity(button)

    // if (UIdisplayName) this.UIdisplayName = UIdisplayName

    sceneMessageBus.on('activatePoap', () => {
      this.activate()
    })

    return this
  }

  public activate(): void {
    const anim = this.getComponent(Animator)

    anim.getClip('Action_POAP').play()

    this.addComponentOrReplace(
      new utils.Delay(4000, () => {
        anim.getClip('Action_POAP').stop()

        anim.getClip('Idle_POAP').play()
      })
    )
  }

  async getCaptcha(): Promise<string> {
    const captchaUUIDQuery = await signedFetch(
      `https://${this.serverURL}/captcha`,
      {
        method: 'POST',
      }
    )
    const json = JSON.parse(captchaUUIDQuery.text)
    return json.data.uuid
  }

  async makeTransaction() {
    const userData = await getUserData()

    // no wallet
    if (!userData || !userData.hasConnectedWeb3) {
      log('no wallet')
      PlayCloseSound()

      boothUI.metamask()
      return
    }

    // already attempted
    if (this.alreadyAttempted) {
      PlayCloseSound()
      boothUI.alreadyClaimed()
      return
    }

    this.alreadyAttempted = true
    const realm = await getCurrentRealm()

    try {
      const captchaUUID = await this.getCaptcha()
      const captchaResult = await boothUI.captcha(this.serverURL, captchaUUID)
      if (captchaResult == undefined) {
        this.alreadyAttempted = false
        return
      }
      const response = await this.claimCall(captchaResult, userData, realm)
      log(response)
      log(response.status)
      const json = await response.json()
      log(json)
      if (response.status == 200) {
        boothUI.viewSuccessMessage(
          json.data.event.name,
          json.data.event.image_url,
          1024,
          1024
        )

        sceneMessageBus.emit('activatePoap', {})
      } else {
        PlayCloseSound()
        switch (json.error) {
          case 'Address already claimed a code for this event':
            UI.displayAnnouncement(`You already claimed this event`, 3)

            break

          default:
            this.alreadyAttempted = false
            UI.displayAnnouncement(
              `Oops, there was an error: "${json.error}"`,
              3
            )
            break
        }
      }
    } catch {
      this.alreadyAttempted = false
      log('Error fetching from POAP server ', this.serverURL)
    }

    return
  }

  async claimCall(captchaResult: string, userData: UserData, realm: Realm) {
    const response = await fetch(
      `https://${this.serverURL}/claim/${this.eventUUID}`,
      {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          address: userData.publicKey,
          catalyst: realm.domain,
          room: realm.room,
          captcha: captchaResult,
        }),
      }
    )
    return response
  }
}
