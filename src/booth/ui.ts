import * as utils from '@dcl/ecs-scene-utils'
import * as UI from '@dcl/ui-scene-utils'
import { PlayCloseSound, PlayCoinSound } from './sounds'

export function timerBeforeClaim(createdTime: Date, delay: number) {
  const mmPrompt = new UI.CustomPrompt(undefined, 450, 200)
  const timeRemaining = (+new Date() + delay - +createdTime) / 1000
  log(timeRemaining)
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = Math.floor(timeRemaining - minutes * 60)
  mmPrompt.addText(
    `You need to wait \n${
      minutes ? `${minutes} minutes${seconds > 0 ? ' and ' : ''}` : ''
    }${seconds ? `${seconds} seconds` : ''}\nbefore claiming this POAP`,
    0,
    0,
    Color4.Black(),
    20
  )
}

/* UI asking to install metamask */
export function metamask() {
  const mmPrompt = new UI.CustomPrompt()

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
}

/* UI asking for captcha solution */
export async function captcha(
  serverURL: string,
  captchaUUID: string
): Promise<string | undefined> {
  return new Promise((resolve) => {
    const captchaUI = new UI.CustomPrompt('dark', 600, 370)
    captchaUI.addText(
      'Please complete this captcha',
      0,
      160,
      Color4.White(),
      24
    )
    captchaUI.addIcon(
      `https://${serverURL}/captcha/${captchaUUID}`,
      0,
      40,
      500,
      150,
      { sourceHeight: 0, sourceWidth: 0 }
    )
    let captchaCode = ''
    captchaUI.addTextBox(0, -75, '', (e) => {
      captchaCode = e
    })
    captchaUI.addButton(
      'Submit',
      100,
      -140,
      () => {
        captchaUI.hide()
        resolve(captchaCode)
      },
      UI.ButtonStyles.ROUNDGOLD
    )
    captchaUI.addButton(
      'Cancel',
      -100,
      -140,
      () => {
        captchaUI.hide()
        resolve(undefined)
      },
      UI.ButtonStyles.ROUNDBLACK
    )
  })
}

export function alreadyClaimed() {
  const prompt = new UI.CustomPrompt()
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
}

export function viewSuccessMessage(
  poapName: string,
  image: string,
  imageSizeX: number,
  imageSizeY: number
) {
  PlayCoinSound()
  const thumbTexture = new Texture(image, { hasAlpha: true })

  const name = new UIText(UI.canvas)
  name.value = poapName
  name.color = Color4.Yellow()
  name.outlineColor = Color4.Black()
  name.outlineWidth = 0.1
  name.positionY = -85
  name.visible = true
  name.fontSize = 30
  name.hTextAlign = 'center'
  name.hAlign = 'center'

  const thumb = new UIImage(UI.canvas, thumbTexture)
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

  const note = new UIText(UI.canvas)
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
