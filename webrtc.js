var localVideo;
var firstPerson = false;
var socketCount = 0;
var socketId;
var localStream;
var socketConnections;

var connections = [];

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};

function pageReady() {

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    var constraints = {
        video: true,
        audio: false,
    };

    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getUserMediaSuccess)
            .then(function(){

                socket = io.connect(config.host, {secure: true});
                socket.on('signal', gotMessageFromServer);    

                socket.on('connect', function(){

                    socketId = socket.id;

                    socket.on('user-left', function(id){
                        var video = document.querySelector('[data-socket="'+ id +'"]');
                        var parentDiv = video.parentElement;
                        video.parentElement.parentElement.removeChild(parentDiv);
                    });


                    socket.on('user-joined', function(id, count, clients){

                        socketConnections = clients;

                        clients.forEach(function(socketid) {


                            //TODO:: This is redundant to start()
                            if(!connections[socketid]){
                                connections[socketid] = new RTCPeerConnection(peerConnectionConfig);
                                //Wait for their ice candidate       
                                connections[socketid].onicecandidate = function(){
                                    if(event.candidate != null) {
                                        console.log('SENDING ICE');
                                        socket.emit('signal', socketid, JSON.stringify({'ice': event.candidate}));
                                    }
                                }

                                //Wait for their video stream
                                connections[socketid].onaddstream = function(){
                                    gotRemoteStream(event, socketid)
                                }    

                                //Add the local video stream
                                connections[socketid].addStream(localStream);                                                                
                            }
                        });
                        start(id, count);
                        
                    });                    
                })       
        
            }); 
    } else {
        alert('Your browser does not support getUserMedia API');
    } 
}

function start(id, count){

    //When someone joins, create a new peer connection with them
    connections[id] = new RTCPeerConnection(peerConnectionConfig);

    //Wait for their ice candidate       
    connections[id].onicecandidate = function(){
        if(event.candidate != null) {
            console.log('SENDING ICE');
            socket.emit('signal', id, JSON.stringify({'ice': event.candidate}));
        }
    }

    //Wait for their video stream
    connections[id].onaddstream = function(){
        gotRemoteStream(event, id)
    }  

    //Add the local video stream
    connections[id].addStream(localStream);

    //Create an offer to connect with your local description
    
    if(count >= 2){
        connections[id].createOffer().then(function(description){
            connections[id].setLocalDescription(description).then(function() {
                // console.log(connections);
                socket.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}));
            }).catch(e => console.log(e));        
        });
    }
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
}


function gotRemoteStream(event, id) {

    var videos = document.querySelectorAll('video'),
        video  = document.createElement('video'),
        div    = document.createElement('div')

    video.setAttribute('data-socket', id);
    video.src      = window.URL.createObjectURL(event.stream);
    video.autoplay = true; 
    video.muted    = true;
    
    div.appendChild(video);      
    document.querySelector('.videos').appendChild(div);      
}

function gotMessageFromServer(fromId, message) {

    //Parse the incoming signal
    var signal = JSON.parse(message)

    //Make sure it's not coming from yourself
    if(fromId != socketId) {

        if(signal.sdp){            
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {                
                if(signal.sdp.type == 'offer') {
                    connections[fromId].createAnswer().then(function(description){
                        connections[fromId].setLocalDescription(description).then(function() {
                            socket.emit('signal', fromId, JSON.stringify({'sdp': connections[fromId].localDescription}));
                        }).catch(e => console.log(e));        
                    }).catch(e => console.log(e));
                }
            }).catch(e => console.log(e));
        }
    
        if(signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
        }                
    }
}