# POAP Booth and Guestbook

A simple scene with an interactive booth that hands out POAP tokens to certify the player's attendance to an event. It also includes a guestbook that can be signed.

This scene connects to a server, that is hosted in Firebase. The code for this server is included in the `/server` folder of this repo. This server performs two functions:

- It stores a list of unique one-use codes that can be redeemed for POAP tokens. Every time an endpoint is hit, it returns one of these codes, and removes it from its database so it's not used again.

- Every time the guestbook is opened, a request is sent to a RESFful API that this server exposes, to fetch all existing signatures. When a new signature is made, another request is sent to that API, including the player's name and id, to add to the database.

![](screenshot/screenshot.png)

When a POAP code is redeemed, the scene then sends a series of requests that include this code and the player's public address to servers from the POAP project, these return a cryptographic signed message. This message can then be used to call the POAP contract to mint a new POAP token that is sent to the player's wallet.

The server can support multiple different events, requests that are made both to the POAP booth and the guestbook endpoints include an "event" parameter that the server uses to route accordingly to the right database collection.

**Install the CLI**

Download and install the Decentraland CLI by running the following command

```bash
npm i -g decentraland
```

For a more details, follow the steps in the [Installation guide](https://docs.decentraland.org/documentation/installation-guide/).

**Previewing the scene**

Once you've installed the CLI, download this example and navigate to its directory from your terminal or command prompt.

_from the scene directory:_

```
$:  dcl start
```

Any dependencies are installed and then the CLI will open the scene in a new browser tab automatically.

Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
