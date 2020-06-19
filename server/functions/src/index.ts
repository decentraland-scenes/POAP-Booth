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

app.get('/hello-world', (req: any, res: any) => {
  return res.status(200).send('Hello World!')
})

const db = admin.firestore()

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

app.get('/get-poap-code', async (req: any, res: any) => {
  let event = req.query.event
  let poapEvent = db.collection('POAP-' + event)
  try {
    let response: any = await poapEvent
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
    return res.status(200).send({ token: response })
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
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

exports.app = functions.https.onRequest(app)
