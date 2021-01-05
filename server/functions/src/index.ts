import { eventData, getPoap, getSecret, signedEventData } from './poap'

const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({ origin: true }))

var admin = require('firebase-admin')

var serviceAccount = require('../permissions.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://decentraland-events.firebaseio.com',
})

const myBlackListedIPS = [`1.1.1.1`]

export function checkBannedIPs(req: any, res: any) {
  for (let ip of myBlackListedIPS) {
    if (req.header('X-Forwarded-For') == ip)
      return res.status(200).send({ token: 'Blocked' })
  }

  if (
    req.header('origin') != 'https://play.decentraland.org' &&
    req.header('origin') != 'https://play.decentraland.zone'
  ) {
    return res.status(200).send({ token: 'Blocked' })
  }
}

app.get('/hello-world', (req: any, res: any) => {
  return res.status(200).send('Hello World!')
})

const db = admin.firestore()

// Signatures

app.get('/get-signatures', async (req: any, res: any) => {
  let event = req.query.event
  let signatures = db.collection('Signatures-' + event)
  try {
    let response: any = []
    await signatures.get().then((queryResult: { docs: any }) => {
      for (let doc of queryResult.docs) {
        response.push(doc.data())
      }
    })
    return res.status(200).send(response)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

app.post('/add-signature', async (req: any, res: any) => {
  let newSignature = req.body
  let event = req.query.event
  let signatures = db.collection('Signatures-' + event)
  try {
    await signatures.doc('/' + newSignature.name + '/').create({
      id: newSignature.id,
      name: newSignature.name,
    })

    return res.status(200).send('Signed book!')
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

// Poaps

app.post('/send-poap', async (req: any, res: any) => {
  let decodedBody: any = await JSON.parse(req.body)

  let id = decodedBody.id
  let event = decodedBody.stage
  //   let server = decodedBody.server
  //   let realm = decodedBody.realm

  checkBannedIPs(req, res)

  try {
    let poapEvent = db.collection('POAP-' + event)

    let qrHex = await poapEvent
      .orderBy('id', 'desc')
      .limit(1)
      .get()
      .then(async (queryResult: { docs: any }) => {
        const doc = queryResult.docs[0]
        const id = doc.get('id')
        console.log('ID IS: ', id)
        doc.ref.delete()
        return id
      })

    if (!qrHex) {
      return res.status(400).send({
        token: null,
        success: false,
        error: 'We are out of POAPs, sorry',
      })
    }

    const secret: eventData = await getSecret(qrHex)

    console.log('POAP Secret:', secret)

    const signature: signedEventData = await getPoap(id, secret, qrHex)

    console.log('POAP Signature:', signature)
    return res.status(400).send({ token: null, success: true })
  } catch (error) {
    console.log('error fetching from POAP server ')
    return res.status(400).send({ token: null, success: false, error: error })
  }
})

app.post('/add-poap-codes', async (req: any, res: any) => {
  let poapCodes = req.body
  let event = req.query.event
  let poapEvent = db.collection('POAP-' + event)
  try {
    for (let token of poapCodes) {
      await poapEvent.doc('/' + token.id + '/').create({
        id: token.id,
      })
    }

    return res.status(200).send('Added tokens!')
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

app.get('/get-all-poaps', async (req: any, res: any) => {
  let event = req.query.event
  let poapEvent = db.collection('POAP-' + event)
  try {
    let response: any = []
    await poapEvent.get().then((queryResult: { docs: any }) => {
      for (let doc of queryResult.docs) {
        response.push(doc.data())
      }
    })
    return res.status(200).send(response)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})

// Claim Blacklist

// app.post('/check-claim', async (req: any, res: any) => {
//   let userId = req.body.id
//   let token = req.body.token
//   let event = req.query.event

//   let signatures = db.collection('Token-' + event)

//   try {
//     let hasToken: boolean = false
//     let tokenCounter: number = 0
//     await signatures.get().then((queryResult: { docs: any }) => {
//       for (let doc of queryResult.docs) {
//         if (doc.get('userId').toUpperCase() == userId.toUpperCase()) {
//           tokenCounter += 1
//           if (doc.get('token') == token) {
//             hasToken = true
//             return res
//               .status(200)
//               .send({ result: hasToken, tokencount: tokenCounter })
//           }
//         }
//       }
//     })
//     return res.status(200).send({ result: hasToken, tokencount: tokenCounter })
//   } catch (error) {
//     console.log(error)
//     return res.status(500).send(error)
//   }
// })

// app.post('/post-claim', async (req: any, res: any) => {
//   let userId = req.body.id
//   let token = req.body.token
//   let event = req.query.event

//   let tokenClaims = db.collection('Token-' + event)
//   try {
//     await tokenClaims.doc('/' + userId + token + '/').create({
//       userId: userId,
//       token: token,
//     })

//     return res.status(200).send('Added to list!')
//   } catch (error) {
//     console.log(error)
//     return res.status(500).send(error)
//   }
// })

exports.app = functions.https.onRequest(app)
