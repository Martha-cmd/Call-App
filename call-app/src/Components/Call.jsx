import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initPeer, createCall, startCall } from "../Peer";
import { initiateCall, endCall } from "../Store/Actions";
import { getAuth } from "firebase/auth";
import { getBalance, updateBalance } from "../firebase-config";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const CALL_RATE = 50; 

const Call = () => {
  const dispatch = useDispatch();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callActive, setCallActive] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [showPreCallModal, setShowPreCallModal] = useState(false);
  const [balance, setBalance] = useState(0);

  const { user, callRate } = useSelector((state) => ({
    user: state.user,
    callRate: state.callRate,
  }));

  // Initialize PeerJS only once with useRef
  const peer = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser && !peer.current) {
      // Initialize PeerJS connection
      peer.current = initPeer(currentUser.uid);

      peer.current.on('open', (id) => {
        console.log('PeerJS connected with ID:', id);
      });

      peer.current.on('error', (err) => {
        console.error('PeerJS error:', err);
      });

      createCall(peer.current, localVideoRef, remoteVideoRef, () => setCallActive(false));
    }

    // Cleaning up PeerJS connection 
    return () => {
      if (peer.current) {
        peer.current.destroy();
        peer.current = null;
      }
    };
  }, []);

  const handleInitiateCall = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userBalance = await getBalance(currentUser.uid);
      setBalance(userBalance);

      if (userBalance < CALL_RATE) {
        toast.error("Insufficient balance to start the call")
      } else {
      setShowPreCallModal(true);
    }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const confirmInitiateCall = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;

      // Deduct balance for the initiator
      await updateBalance(currentUser.uid, -CALL_RATE);

      dispatch(initiateCall(user, receiverId, callRate));

      // Checking if peer.current is initialized before starting the call
      if (peer.current) {
        startCall(peer.current, receiverId, localStream, remoteVideoRef, async () => {
          setCallActive(false);

          // Add balance for the receiver
          await updateBalance(receiverId, CALL_RATE);
          console.log(`Successfully added ${CALL_RATE} to receiver's balance.`);
        });

        setCallActive(true);
        setShowPreCallModal(false);
      } else {
        console.error('PeerJS connection not initialized.');
      }
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  };

  const handleEndCall = async () => {
    try {
      if (peer.current && !peer.current.disconnected) {
        setCallActive(false);
        const auth = getAuth();
        const currentUser = auth.currentUser;

        // Ensure receiverId is set to avoid issues with null id
        if (!receiverId) {
          console.error('Receiver ID is not set.');
          return;
        }

        // Close the call on PeerJS if it exists
        const existingCall = peer.current.call(receiverId);
        if (existingCall) {
          existingCall.close();
        }

        // Dispatch action to end the call
        dispatch(endCall(user, receiverId, Date.now(), callRate));

      } else {
        console.error('PeerJS connection not initialized or is disconnected.');
      }
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const userBalance = await getBalance(currentUser.uid);
      setBalance(userBalance);
      setShowRefreshModal(true);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const closeModalAndRefresh = () => {
    setShowRefreshModal(false);
    window.location.reload(); 
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-24 py-10 gap-10">
      <input
        type="text"
        placeholder="Enter receiver ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        className="w-[50%] border border-gray-500 p-3 rounded-[13px] mb-10"
      />
      <button className="bg-[#FA6C6C] text-white py-3 px-5 rounded" onClick={callActive ? handleRefresh: handleInitiateCall}>
        {callActive ? "End Call" : "Start Call"}
      </button>
      <div className="w-full flex flex-wrap gap-5">
        <p>You</p>
        <video ref={localVideoRef} autoPlay muted className="w-full h-[60vh] bg-black rounded-[13px]"></video>
        <p>Receiver</p>
        <video ref={remoteVideoRef} autoPlay className="w-full h-[60vh] bg-black rounded-[13px]"></video>
      </div>

      {showRefreshModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div role="alert" className="alert flex flex-col gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info h-6 w-6 shrink-0">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h1 className="text-center font-semibold">Wallet Balance:</h1>
              <span>Your current balance is: {balance}</span>
               <div>
                <button className="btn btn-sm btn-primary bg-blue-500 py-1 px-5 rounded text-white" onClick={closeModalAndRefresh}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreCallModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div role="alert" className="alert flex flex-col gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info h-6 w-6 shrink-0">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>Your current balance is: {balance}</p>
              <p>Call rate is: {CALL_RATE} per call</p>
              <div className="w-full flex justify-between mt-2">
                <button className="btn btn-sm bg-red-400 py-1 px-5 rounded text-white" onClick={() => setShowPreCallModal(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary bg-blue-500 py-1 px-5 rounded text-white" onClick={confirmInitiateCall}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toastStyle={{backgroundColor: "black", color: "white"}}/>
    </div>
  );
};

export default Call;
