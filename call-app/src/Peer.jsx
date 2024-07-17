import Peer from 'peerjs';

export const initPeer = (id) => {
  return new Peer(id, {
    key: 'peerjs',
    host: 'localhost', // server address
    port: 9000,        // server port
    path: '/'
  });
};

export const createCall = (peer, localVideoRef, remoteVideoRef, onCallEnded) => {
  peer.on('call', (call) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      call.answer(stream); // stream that answers call

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      call.on('close', () => {
        onCallEnded();
      });
    }).catch(err => {
      console.error('Failed to get local stream', err);
    });
  });
};

export const startCall = (peer, receiverId, localStream, remoteVideoRef, onCallEnded) => {
  const call = peer.call(receiverId, localStream);

  call.on('stream', (remoteStream) => {
    remoteVideoRef.current.srcObject = remoteStream;
  });

  call.on('close', () => {
    onCallEnded();
  });

  call.on('error', (err) => {
    console.error('Call error:', err);
  });
};
