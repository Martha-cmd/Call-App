import React, { useState } from "react";
import { auth, firestore } from "../firebase-config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { ToastContainer, toast  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const Auth = () => {
  const [email, setEmail] = useState(" ");
  const [password, setPassword] = useState(" ");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // const userCollection = collection(firestore, "users");
      const userDoc = doc(firestore, "users", user.uid);
  
      await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          balance: 100,
      }).catch(error => {
           console.log("Error adding document: ", error);
      })
  
      toast.success("Successfully signed up!")
    } catch(error) {
           toast.error(`Error siging in`);
           console.log("Error siging in: ", error.message );
    }
    
  };

  const handleSignIn = async () => {

    await signInWithEmailAndPassword(auth, email, password);
    console.log("success");
    toast.success('Welcome');
    setTimeout(() => {
        navigate('/call');
    }, 2000)
  };

  return (
    <div className="mt-20 flex flex-col items-center w-full h-[80vh] justify-center">
       <h1 className='font-semibold text-2xl'>Call App</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-[50%] border border-gray-500 p-3 rounded-[13px] my-10"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-[50%] border border-gray-500 p-3 rounded-[13px]"
      />
      <button onClick={handleSignUp} className="bg-blue-500 w-[50%] px-5 py-4 rounded-[13px] text-white mt-10 mb-5">Sign Up</button>
      
      <button onClick={handleSignIn} className="border border-black w-[50%] px-5 py-4 rounded-[13px] focus:bg-blue-500 focus:text-white">Sign In</button>

      <ToastContainer toastStyle={{backgroundColor: "black", color: "white"}} />
    </div>
  );
};

export default Auth;
