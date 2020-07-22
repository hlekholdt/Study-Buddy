// Import stylesheets
import "./style.css";

// Firebase App (the core Firebase SDK) is always required
// and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from "firebaseui";

import React from 'react';

const createNewSessionBtn= document.getElementById('Create New Session Btn');

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
// var firebaseConfig = {};

// firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

// Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAKtmlPtRug7nP_1PVzPm5k19O1LZT6kEs",
    authDomain: "studybuddyapp-7da8b.firebaseapp.com",
    databaseURL: "https://studybuddyapp-7da8b.firebaseio.com",
    projectId: "studybuddyapp-7da8b",
    storageBucket: "studybuddyapp-7da8b.appspot.com",
    messagingSenderId: "465355416659",
    appId: "1:465355416659:web:50d5369e80dfc2e77552a6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

// Initialize the FirebaseUI widget using Firebase
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// ... 
// At the bottom

// Listen to RSVP button clicks
// ...
// Called when the user clicks the RSVP button
startRsvpButton.addEventListener("click",
 () => {
    if (firebase.auth().currentUser) {
      // User is signed in; allows user to sign out
      firebase.auth().signOut();
    } else {
      // No user is signed in; allows user to sign in
      ui.start("#firebaseui-auth-container", uiConfig);
    }
});

// ...
// Listen to the current Auth state
firebase.auth().onAuthStateChanged((user)=> {
  if (user) {
    startRsvpButton.textContent = "LogOut"
    // Show guestbook to logged-in users
   guestbookContainer.style.display = "block";
   // Subscribe to the guestbook collection
  subscribeGuestbook();
  }
  else {
    startRsvpButton.textContent = "Sign-In"
    // Hide guestbook for non-logged-in users
   guestbookContainer.style.display = "none";
   // Unsubscribe from the guestbook collection
  unsubscribeGuestbook();
  }
});

// ..
// Listen to the form submission
form.addEventListener("submit", (e) => {
 // Prevent the default form redirect (so no refresh after user writes in)
 e.preventDefault();
 // Write a new message to the database collection "guestbook"
 firebase.firestore().collection("guestbook").add({
   text: input.value,
   timestamp: Date.now(),
   name: firebase.auth().currentUser.displayName,
   userId: firebase.auth().currentUser.uid
 })
 // clear message input field
 input.value = ""; 
 // Return false to avoid redirect
 return false;
});

//Listen to guestbook updates
function subscribeGuestbook(){
   // Create query for messages
 guestbookListener = firebase.firestore().collection("guestbook")
 .orderBy("timestamp","desc")
 .onSnapshot((snaps) => {
   // Reset page
   guestbook.innerHTML = "";
   // for each loop through database
   snaps.forEach((doc) => {
     // Create an HTML entry for each document and add it to the chat
     const entry = document.createElement("p");
     entry.textContent = doc.data().name + ": " + doc.data().text;
     guestbook.appendChild(entry);
   });
 });
};

//Unsubscribe from guestbook updates
function unsubscribeGuestbook(){
 if (guestbookListener != null)
 {
   guestbookListener();
   guestbookListener = null;
 }
};
 
var yourVideo = document.getElementById("YourVideo");
var friendsVideo = document.getElementById("StudyBuddyVideo");
var yourId = Math.floor(Math.random() * 1000000000);
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'},  {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'hekholdt','username': 'hekholdt@mail.com'}]};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data){
  var msg = database.push({ sender: senderId, message: data});
  msg.remove();
  var database= firebase.database().ref();
  database.on('child_added', readMessage);
}

function readMessage(data){
  var msg = JSON.parse(data.val().message);
 var sender = data.val().sender;
 if (sender != yourId) {
 if (msg.ice != undefined)
 pc.addIceCandidate(new RTCIceCandidate(msg.ice));
 else if (msg.sdp.type == "offer")
 pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
 .then(() => pc.createAnswer())
 .then(answer => pc.setLocalDescription(answer))
 .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
 else if (msg.sdp.type == "answer")
 pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
 }
};

function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true}).ten(stream => yourVideo.srcObject = stream).then(stream => pc.addStream(stream));
}

function showFriendsFace() {
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
}