
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({ origin: true }))
require('isomorphic-fetch')

const EthCrypto = require('eth-crypto');

//let awsBaseURL = 'https://soho-plaza.s3.us-east-2.amazonaws.com/'

app.get('/hello-world', (req, res) => {

	return res.status(200).send('Hello World!')
})


app.get('/get-poap-code', async (req, res) => {
	let playerId = req.query.playerid
	let poapCode = 2
	if (req.query.code) {
		poapCode = req.query.code
	}

	let secret = await callAPI(poapCode)
	const signature = await signMessage(
		secret.secret,
		secret.event_id,
		playerId
	)


	return res.status(200).send({ signedCode: signature, event: secret.event_id })
})

const codes = [
	'1w0xcv',
	'plx9pw',
	'2mrsj1',
	'g3i1pt',
	'on2kr8',
	'34ledn',
	'arcts1',
	'b5qv9m',
	'ln44td',
	'fkfbvv',
]

async function getCode(poapCode) {
	return codes[poapCode]
}


async function callAPI(poapCode) {
	const code = await getCode(poapCode)
	const url = 'https://api.poap.xyz/actions/claim-qr?qr_hash=' + code
	try {
		let response = await fetch(url)
		let json = await response.json()
		console.log(json)
		return json
	} catch {
		console.log('error fetching from POAP server')
	}
}


function signMessage(privateKey, event, address) {

	let params = [
		{ type: "uint256", value: event },
		{ type: "address", value: address }
	];

	const message = EthCrypto.hash.keccak256(params);
	return EthCrypto.sign(privateKey, message);
}



exports.app = functions.https.onRequest(app)




/// OLD EXPERIMENT:

// export async function signMessage(
// 	poapKey,
// 	event,
// 	playerId
// ) {

// 	let params = [
// 		{ type: 'uint256', value: event },
// 		{ type: 'address', value: playerId },
// 	]

// 	const provider = await getProvider()
// 	const requestManager = new eth.RequestManager(provider)

// 	log('trying to sign')
// 	let publicVersionOfKey = await requestManager.personal_importRawKey(
// 		poapKey,
// 		'1234'
// 	)

// 	signature = requestManager.personal_sign(
// 		publicVersionOfKey,
// 		params.toString(),
// 		'1234'
// 	)

// 	// const message = EthCrypto.hash.keccak256(params);
// 	// return ethController.signMessage(privateKey, message);

// 	log('signature: ', signature)

// 	return signature
// }