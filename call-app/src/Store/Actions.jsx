// src/store/actions.js
import { firestore } from "../firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const initiateCall = (caller, receiverId, callRate) => {
  return async (dispatch) => {
    const startTime = Date.now();

    // Implement call logic with PeerJS

    dispatch({
      type: "CALL_INITIATED",
      payload: { caller, receiverId, startTime, callRate },
    });
  };
};

export const endCall = (caller, receiverId, startTime, callRate) => {
  return async (dispatch) => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // duration in seconds
    const cost = duration * callRate;

    // Update balances in Firebase
    const callerDoc = await getDoc(doc(firestore, "users", caller.id));
    const receiverDoc = await getDoc(doc(firestore, "users", receiverId));

    await updateDoc(doc(firestore, "users", caller.id), {
      balance: callerDoc.data().balance - cost,
    });

    await updateDoc(doc(firestore, "users", receiverId), {
      balance: receiverDoc.data().balance + cost,
    });

    dispatch({
      type: "CALL_ENDED",
      payload: { caller, receiverId, duration, cost },
    });
  };
};
