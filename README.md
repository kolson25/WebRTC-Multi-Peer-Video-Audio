# WebRTC Multi-Peer Video & Audio

This library creates a traditional multi-peer communication using a single signaling server.  Videos are added to the screen as users join and accept use of their cameras and microphones.  As users disconnect, their videos are removed from all sessions.

![Demo](readme-attachments/demo.gif)

## 1. Setup The Signaling Server
The signaling server can be created and run with nodejs.  Realtime communication is achieved using socket.io
1. Copy the server folder onto your server
2. Setup approproate vhosts -- By default, the server will run on port `3000`
3. `cd server`
4. `npm install`
5. `node app.js`

## 2. Setup the Client
Client code can be run locally, or from a webserver.
1. Add a `config.js` file into the root of the client folder
2. Add your server URL to the `config.js` file
```
var config = {
	host: 'https://mywebsite.com:443'
}
```
3. Load the index.html page in the browser


## Browser Support
This codebase has been tested in the following browsers:
- Chrome
- Safari 11 - Mobile

## Known Issues/Notes
- Safari 10 mobile does not support WEBrtc
- Safari 10 desktop has an issue displaying video - In progress
- Firefox has an issue displaying remote video - In progress
