# POAP Booth and Guestbook

A simple scene with an interactive booth that hands out POAP tokens to certify the player's attendance to an event. It also includes a guestbook that can be signed.

![](screenshot/screenshot.png)

This scene shows you:

- How to interact with the functions of a smart contract
- How to obtain a player's wallet address
- How to send requests to an API
- How to set up your own API in a server with its own database
- How to use the messagebus to sync events between players

This scene connects to a server, that is hosted in Firebase. The code for this server is included in the `/server` folder of this repo. This server performs two functions:

- It stores a list of unique one-use codes that can be redeemed for POAP tokens. Every time an endpoint is hit, it returns one of these codes, and removes it from its database so it's not used again.

- Every time the guestbook is opened, a request is sent to a RESFful API that this server exposes, to fetch all existing signatures. When a new signature is made, another request is sent to that API, including the player's name and id, to add to the database.



When a POAP code is redeemed, the scene then sends a series of requests that include this code and the player's public address to servers from the POAP project, these return a cryptographic signed message. This message can then be used to call the POAP contract to mint a new POAP token that is sent to the player's wallet.

The server can support multiple different events, requests that are made both to the POAP booth and the guestbook endpoints include an "event" parameter that the server uses to route accordingly to the right database collection.
## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```bash
npm i -g decentraland
```

**Previewing the scene**

Download this example and navigate to its directory, then run:

```
$:  dcl start
```

Any dependencies are installed and then the CLI opens the scene in a new browser tab.

Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

## Launch and use the server

Each POAP token that is minted must present a claim code, these are handed out manually by the POAP team, please [get in touch with them](poap.xyz) to obtain claim codes for your event.

Once you have these claim codes, a server must handle them so that the same claim code isn't reused.

1) Host a server containing the contents of the `/server` folder in this repository. [This tutorial](https://decentraland.org/blog/tutorials/servers-part-2/) can help you achieve that on Firebase, or you can use any other hosting service. 

2) Send a POST request to the server to upload all of the claim codes to the server's DB

```
<server-address>/add-poap-codes/?event=eventname
```

Eventname is a unique string that identifies the event.
The body of the request needs to include all of the claim codes in an array, structured as:

```
[ {"id": "code1"}, {"id": "code2"}, ...  ]
```

3) Once those codes are uploaded to the server, you can fetch one at a time with a GET request to:
```
<server-address>/get-poap-code/?event=eventname
```

`eventname` needs to match the event name used in the previous request

> TIP: Once a code is fetched, it's removed from the DB, so don't spend too many of them testing.

4) If that works well, then modify the scene in the `POAP-booth` folder of this repo in the following ways to match your event: 

- In the `poapHanlder.ts` file, change the value of `fireBaseServer` to match your server's address
- In the `game.ts` file, change the last parameter when initializing the `POAPBooth` object, so that the string matches the `eventname` string you used when uploading the claim codes to the server.

So, for example if you called your event `myevent`

```ts
let POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
  },
  'myevent'
)
```

> TIP: When running a local preview of this scene with `dcl start`, you won't be able to fetch a POAP, because in preview mode you use a fake random id that won't match the one on your Metamask. You will be able to call a transaction, but the transaction will have an error. Once deployed it should work fine.

If something doesn’t work, please [file an issue](https://github.com/decentraland-scenes/Awesome-Repository/issues/new).


## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
