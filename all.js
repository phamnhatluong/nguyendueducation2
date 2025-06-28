import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKR_Urt79aX0GqcN52CEwLCJi9bF_iD98",
  authDomain: "nguyendueducation-44987.firebaseapp.com",
  projectId: "nguyendueducation-44987",
  storageBucket: "nguyendueducation-44987.firebasestorage.app",
  messagingSenderId: "646604023441",
  appId: "1:646604023441:web:1a1c5bf0097d52b170c130",
  measurementId: "G-0F0C5MPPD4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Lấy dữ liệu người dùng từ localStorage
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || !currentUser.email) {
  window.location.href = "login.html";
}

const userAvatar = document.getElementById("userAvatar");
const accountAvatar = document.querySelector(".account-avatar");
const avatarInput = document.getElementById("avatarInput");
const welcomeText = document.getElementById("welcomeText");
const welcomeAccount = document.getElementById("welcomeaccount");

// Hiển thị dữ liệu ban đầu từ localStorage
if (welcomeText)
  welcomeText.innerText = `Xin chào, ${
    currentUser.username || currentUser.email
  }`;
if (welcomeAccount)
  welcomeAccount.innerText = currentUser.username || currentUser.email;
if (currentUser.avatar) {
  if (userAvatar) userAvatar.src = currentUser.avatar;
  if (accountAvatar) accountAvatar.src = currentUser.avatar;
}

// Đồng bộ dữ liệu mới nhất từ Firestore
if (currentUser?.email) {
  getDoc(doc(db, "users", currentUser.email)).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      currentUser = { ...data };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      if (welcomeText)
        welcomeText.innerText = `Xin chào, ${
          currentUser.username || currentUser.email
        }`;
      if (welcomeAccount)
        welcomeAccount.innerText = currentUser.username || currentUser.email;
      if (currentUser.avatar) {
        if (userAvatar) userAvatar.src = currentUser.avatar;
        if (accountAvatar) accountAvatar.src = currentUser.avatar;
      }
    }
  });
}

// Logout
window.logout = function () {
  localStorage.removeItem("currentUser");
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

// Bấm avatar để vào trang account
if (userAvatar) {
  userAvatar.addEventListener("click", () => {
    window.location.href = "account.html";
  });
}

// Copilot script (giữ nguyên)
(function (w, d, s, o, f, js, fjs) {
  w[o] =
    w[o] ||
    function () {
      (w[o].q = w[o].q || []).push(arguments);
    };
  (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
  js.id = o;
  js.src = f;
  js.async = 1;
  js.referrerPolicy = "origin";
  fjs.parentNode.insertBefore(js, fjs);
})(
  window,
  document,
  "script",
  "copilot",
  "https://script.copilot.live/v1/copilot.min.js?tkn=cat-bndlngf5"
);
copilot("init", {});
