const socket = io('/');

const videoGrid = document.getElementById('video_grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  host: '/',
  port: '5001',
});

peer.on('open', (id) => {
  console.log('thi is ', id);
  socket.emit('join-room', ROOM_ID, id);
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    peer.on('call', (call) => {
      console.log('inside peer call');
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

function connectToNewUser(userId, stream) {
  console.log('usrid', userId);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
