import { signGuestBook, getGuestBook } from './guestbook'

export const screenSpaceUI = new UICanvas()
screenSpaceUI.visible = true

let UIOpenTime

const imageTexture = new Texture('images/UI_Guestbook.png')
const scaleMultiplier = 0.7

var linesPerGuestBookPage = 14

export async function openUI(event: string) {
  UIOpenTime = +Date.now()
  background.visible = true
  background.isPointerBlocker = true
  let guestBookPage = 1

  let allSignatures = await getGuestBook(event)
  let totalPages = displaySignatures(allSignatures, guestBookPage)

  SignButton.onClick = new OnClick(() => {
    signGuestBook(event)
    closeUI()
    log('signed guestbook')
  })

  log('On page ', guestBookPage, ' of ', totalPages)

  if (totalPages < 2) {
    LastButton.visible = false
    NextButton.visible = false
  } else {
    LastButton.visible = false
    NextButton.visible = true
  }

  NextButton.onClick = new OnClick(async () => {
    guestBookPage += 1

    allSignatures = await getGuestBook(event)
    displaySignatures(allSignatures, guestBookPage)
    LastButton.visible = true
    if (guestBookPage >= totalPages) {
      NextButton.visible = false
    }
  })

  LastButton.onClick = new OnClick(async () => {
    guestBookPage -= 1
    if (guestBookPage < 1) {
      guestBookPage = 1
    }
    allSignatures = await getGuestBook(event)
    displaySignatures(allSignatures, guestBookPage)
    NextButton.visible = true
    if (guestBookPage == 1) {
      LastButton.visible = false
    }
  })
}

export function closeUI() {
  background.visible = false
  background.isPointerBlocker = false
}

export const background = new UIImage(screenSpaceUI, imageTexture)
background.name = 'background'
background.width = 1024 * scaleMultiplier
background.height = 921 * scaleMultiplier
background.hAlign = 'center'
background.vAlign = 'center'
background.sourceLeft = 0
background.sourceTop = 76
background.sourceWidth = 1024
background.sourceHeight = 921
background.visible = false
background.isPointerBlocker = false

export const signaturesUI = new UIText(background)
signaturesUI.value = 'Fetching signatures'
signaturesUI.name = 'signatures'
signaturesUI.width = '650px'
signaturesUI.height = '800px'
signaturesUI.hAlign = 'center'
signaturesUI.vAlign = 'center'
signaturesUI.positionY = 0
signaturesUI.positionX = 0
signaturesUI.fontSize = 25
signaturesUI.vTextAlign = 'center'
signaturesUI.hTextAlign = 'center'
signaturesUI.color = Color4.FromHexString('#53508F88')

export const SignButton = new UIImage(background, imageTexture)
SignButton.name = 'SignButton'
SignButton.width = 460 * scaleMultiplier
SignButton.height = 75 * scaleMultiplier
SignButton.hAlign = 'center'
SignButton.vAlign = 'center'
SignButton.positionY = (-839 + 921 / 2) * scaleMultiplier
SignButton.positionX = 0
SignButton.sourceLeft = 76
SignButton.sourceTop = 0
SignButton.sourceWidth = 460
SignButton.sourceHeight = 75

export const NextButton = new UIImage(background, imageTexture)
NextButton.name = 'NextButton'
NextButton.width = 76 * scaleMultiplier
NextButton.height = 76 * scaleMultiplier
NextButton.hAlign = 'center'
NextButton.vAlign = 'center'
NextButton.positionY = 0
NextButton.positionX = 300
NextButton.sourceLeft = 537
NextButton.sourceTop = 0
NextButton.sourceWidth = 75
NextButton.sourceHeight = 75

export const LastButton = new UIImage(background, imageTexture)
LastButton.name = 'LastButton'
LastButton.width = 76 * scaleMultiplier
LastButton.height = 76 * scaleMultiplier
LastButton.hAlign = 'center'
LastButton.vAlign = 'center'
LastButton.positionY = 0
LastButton.positionX = -300
LastButton.sourceLeft = 0
LastButton.sourceTop = 0
LastButton.sourceWidth = 75
LastButton.sourceHeight = 75

// arrange all signatures into pages
function displaySignatures(allSignatures: any[], guestBookPage: number) {
  let signaturePage = 0
  let signatureList = ['']
  for (let i = 0; i < allSignatures.length; i++) {
    signatureList[signaturePage] = signatureList[signaturePage].concat(
      allSignatures[i].name
    )
    signatureList[signaturePage] = signatureList[signaturePage].concat(' - ')
    let lines = signatureList[signaturePage].split('\n')
    if (lines[lines.length - 1].length > 25) {
      signatureList[signaturePage] = signatureList[signaturePage].concat('\n')
    }

    if (lines.length >= linesPerGuestBookPage) {
      signaturePage += 1
      signatureList.push('')
      //guestBookPage
    }
  }
  signaturesUI.value = signatureList[guestBookPage - 1]
  log(
    'signature to show from page ',
    guestBookPage,
    ' :',
    signatureList[guestBookPage - 1]
  )

  return signatureList.length
}

// Instance the input object
const input = Input.instance

//button down event
input.subscribe('BUTTON_DOWN', ActionButton.POINTER, false, (e) => {
  const currentTime = +Date.now()
  let isOpen: boolean
  if (background.visible) {
    isOpen = true
  } else {
    isOpen = false
  }

  if (isOpen && currentTime - UIOpenTime > 100) {
    closeUI()
  }
})
