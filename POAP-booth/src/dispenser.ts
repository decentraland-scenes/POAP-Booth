// import { openUI1 } from './ui'
import utils from '../node_modules/decentraland-ecs-utils/index'
import { makeTransaction } from './poapHandler'
import { sceneMessageBus } from './game'

export class Dispenser extends Entity {
  idleAnim = new AnimationState('Idle_POAP', { looping: true })
  buyAnim = new AnimationState('Action_POAP', { looping: false })
  buttonAnim = new AnimationState('Button_Action', { looping: false })
  id: string
  constructor(
    model: GLTFShape,
    transform: TranformConstructorArgs,
    wearableName?: string,
    id?: string

    //,sound: AudioClip
  ) {
    super()
    engine.addEntity(this)

    this.addComponent(model)
    this.addComponent(new Transform(transform))

    this.addComponent(new Animator())
    this.getComponent(Animator).addClip(this.idleAnim)
    this.getComponent(Animator).addClip(this.buyAnim)
    this.idleAnim.play()

    this.id = id

    let button = new Entity()
    button.addComponent(new GLTFShape('models/POAP_button.glb'))
    button.addComponent(new Animator())
    button.getComponent(Animator).addClip(this.buttonAnim)
    button.setParent(this)
    button.addComponent(
      new OnPointerDown(
        (e) => {
          button.getComponent(Animator).getClip('Action').stop()
          button.getComponent(Animator).getClip('Action').play()
          sceneMessageBus.emit('activatePoap', {})
          makeTransaction()
          //openUI1(wearableName, this)
        },
        { hoverText: 'Get Attendance Token' }
      )
    )
    engine.addEntity(button)

    //this.addComponent(new AudioSource(sound))
  }

  public activate(): void {
    let anim = this.getComponent(Animator)

    anim.getClip('Idle_POAP').stop()
    anim.getClip('Action_POAP').stop()

    anim.getClip('Action_POAP').play()

    this.addComponentOrReplace(
      new utils.Delay(4000, () => {
        anim.getClip('Action_POAP').stop()

        anim.getClip('Idle_POAP').play()
      })
    )
  }
}
