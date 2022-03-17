# POAP Booth

A simple scene with an interactive booth that hands out POAP tokens to certify the player's attendance to an event.

![](screenshot/screenshot.png)

This scene shows you:

- How to interact with the functions of a smart contract
- How to obtain a player's wallet address
- How to send requests to an API
- How to use the messagebus to sync events between players

> Important: This scene connects to a server that stores the POAP codes to be claimed. See [Hand out POAP Tokens](https://docs.decentraland.org/development-guide/poap-tokens/) for instructions for how to set up this server.

When a POAP code is redeemed, the scene then sends a series of requests that include this code and the player's public address to servers from the POAP project, these return a cryptographic signed message. This message can then be used to call the POAP contract to mint a new POAP token that is sent to the player's wallet.

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

If you click on the booth, this will send a request to attempt to claim a POAP token to a server. This request will fail the server's validations if you run the scene on a local preview. Only requests performed from inside Decentraland are allowed to work.

Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

## Set up an event

Each copy of a POAP token that is minted must present a single-use claim code, these are handed out by the POAP team when creating an event. A Decentraland POAP server acts as an intermediary to assign a unique claim code to each player, this server also requests a token using that claim code on behalf of the player.

See [Hand out POAP Tokens](https://docs.decentraland.org/development-guide/poap-tokens/) for instructions on how to set up the event and the Decentraland POAP sever.

## Set up the scene

Once the event and the Decentraland POAP server are set up, modify the `game.ts` file in this repo, when initializing the `POAPBooth` object, to match your event:

Change the second parameter, `eventUUID`, so that the string matches the `uuid` string that was returned by the Decentraland POAP server when registering the event.

So, for example if the Decentraland POAP server assigned you a UUID of `123456789-1234-1234-1234-123456789123`, your `game.ts` file should look like this:

```ts
const POAPBooth = new Dispenser(
  {
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0, 0, 0),
  },
  '123456789-1234-1234-1234-123456789123'
)
```

> TIP: When running a local preview of this scene with `dcl start`, you won't be able to fetch a POAP, because in preview mode you use a fake random id that won't match the one on your Metamask. You will be able to call a transaction, but the transaction will have an error. Once deployed it should work fine.

If something doesn’t work, please [file an issue](https://github.com/decentraland-scenes/Awesome-Repository/issues/new).

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
