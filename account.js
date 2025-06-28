import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
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

let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || !currentUser.email) {
  window.location.href = "login.html";
}

const userAvatar = document.getElementById("userAvatar");
const accountAvatar = document.querySelector(".account-avatar");
const avatarInput = document.getElementById("avatarInput");
const welcomeText = document.getElementById("welcomeText");
const welcomeAccount = document.getElementById("welcomeaccount");

const backgroundImg = document.querySelector(".background-img");
const backgroundInput = document.getElementById("backgroundInput");
const selectImgBtn = document.querySelector(".select-img");

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
if (currentUser.background && backgroundImg) {
  backgroundImg.src = currentUser.background;
}

window.logout = function () {
  localStorage.removeItem("currentUser");
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

if (userAvatar) {
  userAvatar.addEventListener("click", () => {
    window.location.href = "account.html";
  });
}

if (accountAvatar && avatarInput) {
  accountAvatar.addEventListener("click", () => {
    const accept = confirm("Bạn có muốn đổi ảnh đại diện không?");
    if (accept) {
      avatarInput.click();
    }
  });

  avatarInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nguyendueducation");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/djaw7n4af/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const imageUrl = data.secure_url;

      if (userAvatar) userAvatar.src = imageUrl;
      if (accountAvatar) accountAvatar.src = imageUrl;

      currentUser.avatar = imageUrl;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      await setDoc(doc(db, "users", currentUser.email), currentUser);
      const postQuery = query(
        collection(db, "posts"),
        where("author", "==", currentUser.email)
      );
      const postSnap = await getDocs(postQuery);
      for (const docSnap of postSnap.docs) {
        await updateDoc(docSnap.ref, {
          avatar: imageUrl,
        });

        const commentQuery = collection(docSnap.ref, "comments");
        const commentSnap = await getDocs(commentQuery);
        for (const commentDoc of commentSnap.docs) {
          const data = commentDoc.data();
          if (data.author === currentUser.email) {
            await updateDoc(commentDoc.ref, {
              avatar: imageUrl,
            });
          }

          const replyQuery = collection(commentDoc.ref, "replies");
          const replySnap = await getDocs(replyQuery);
          for (const replyDoc of replySnap.docs) {
            const rdata = replyDoc.data();
            if (rdata.author === currentUser.email) {
              await updateDoc(replyDoc.ref, {
                avatar: imageUrl,
              });
            }
          }
        }
      }

      alert("Ảnh đại diện đã được cập nhật!");
      location.reload();
    } catch (error) {
      console.error("Upload avatar thất bại:", error);
      alert("Không thể cập nhật ảnh đại diện. Vui lòng thử lại.");
    }
  });
}

selectImgBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const accept = confirm("Bạn có muốn thay đổi hình nền không?");
  if (accept && backgroundInput) {
    backgroundInput.click();
  }
});

backgroundImg.addEventListener("click", () => {
  const accept = confirm("Bạn muốn đổi ảnh nền?");
  if (accept && backgroundInput) {
    backgroundInput.click();
  }
});

backgroundInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "nguyendueducation");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/djaw7n4af/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    const imageUrl = data.secure_url;

    if (backgroundImg) backgroundImg.src = imageUrl;

    currentUser.background = imageUrl;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    await setDoc(doc(db, "users", currentUser.email), currentUser);

    alert("Ảnh nền đã được cập nhật!");
  } catch (error) {
    console.error("Upload background thất bại:", error);
    alert("Không thể cập nhật ảnh nền. Vui lòng thử lại.");
  }
});

const change_name = document.querySelector(".btn-change-name");
change_name.addEventListener("click", async function (event) {
  event.preventDefault();
  const newName = prompt("Nhập tên mới của bạn:");
  if (newName && newName.trim() !== "") {
    currentUser.username = newName.trim();
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    try {
      await setDoc(
        doc(db, "users", currentUser.email),
        {
          ...currentUser,
          username: currentUser.username,
        },
        { merge: true }
      );

      await updateAllUsernames();

      const postQuery = query(
        collection(db, "posts"),
        where("author", "==", currentUser.email)
      );
      const postSnap = await getDocs(postQuery);
      for (const docSnap of postSnap.docs) {
        await updateDoc(docSnap.ref, {
          username: currentUser.username,
        });

        const commentQuery = collection(docSnap.ref, "comments");
        const commentSnap = await getDocs(commentQuery);
        for (const commentDoc of commentSnap.docs) {
          const data = commentDoc.data();
          if (data.author === currentUser.email) {
            await updateDoc(commentDoc.ref, {
              username: currentUser.username,
            });
          }

          const replyQuery = collection(commentDoc.ref, "replies");
          const replySnap = await getDocs(replyQuery);
          for (const replyDoc of replySnap.docs) {
            const rdata = replyDoc.data();
            if (rdata.author === currentUser.email) {
              await updateDoc(replyDoc.ref, {
                username: currentUser.username,
              });
            }
          }
        }
      }

      if (welcomeText) welcomeText.innerText = ` ${currentUser.username}`;
      if (welcomeAccount) welcomeAccount.innerText = ` ${currentUser.username}`;
      alert("Tên đã được cập nhật!");
      location.reload();
    } catch (err) {
      alert("Lỗi khi lưu tên vào Firestore.");
      console.error(err);
    }
  } else {
    alert("Tên không hợp lệ hoặc đã bị hủy.");
  }
});

(async () => {
  if (currentUser?.email) {
    const userDoc = await getDoc(doc(db, "users", currentUser.email));
    if (userDoc.exists()) {
      const data = userDoc.data();
      currentUser = {
        ...data,
        username: data.username || data.email,
      };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      if (welcomeText) welcomeText.innerText = ` ${currentUser.username}`;
      if (welcomeAccount) welcomeAccount.innerText = ` ${currentUser.username}`;
      if (currentUser.avatar) {
        document
          .querySelectorAll("[userAvatar]")
          .forEach((el) => (el.src = currentUser.avatar));
      }
      if (currentUser.background && backgroundImg) {
        backgroundImg.src = currentUser.background;
      }
    }
  }
})();

const btn_add_status = document.querySelector(".btn-add-status");
const status_account = document.querySelector(".status-account");
const text_status = document.querySelector(".text-status");
const add_status = document.querySelector(".add-status");

let isActive = false;

btn_add_status.addEventListener("click", function (event) {
  event.preventDefault();
  isActive = !isActive;

  if (isActive) {
    setTimeout(() => {
      document.querySelector(".status-account");
      text_status.classList.add("text-status-active");
      add_status.classList.add("add-status-active");
    }, 300);
    status_account.classList.add("status-account-active");
  } else {
    setTimeout(() => {
      document.querySelector(".status-account");
      status_account.classList.remove("status-account-active");
    }, 300);
    text_status.classList.remove("text-status-active");
    add_status.classList.remove("add-status-active");
  }
});
add_status.addEventListener("click", async () => {
  const content = text_status.value.trim();
  if (!content) {
    alert("Nội dung bài viết trống!");
    return;
  }

  try {
    await addDoc(collection(db, "posts"), {
      author: currentUser.email,
      username: currentUser.username,
      avatar: currentUser.avatar,
      content,
      createdAt: serverTimestamp(),
      likes: [],
    });

    alert("Đăng bài thành công!");
    text_status.value = "";
  } catch (err) {
    console.error("Lỗi khi đăng bài:", err);
    alert("Không thể đăng bài. Thử lại sau.");
  }
});

const userPostsDiv = document.getElementById("user-posts");
function renderPost(docSnap) {
  const data = docSnap.data();
  const postId = docSnap.id;
  const liked = (data.likes || []).includes(currentUser.email);

  const div = document.createElement("div");
  div.className = "card mb-3";
  div.innerHTML = `
    <div class="card-body position-relative">
      <div class="position-absolute top-0 end-0 mt-2 me-2 d-flex gap-1">
        <button class="btn btn-sm btn-warning" onclick="editPost('${postId}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deletePost('${postId}')">🗑️</button>
      </div>
      <div class="d-flex align-items-center mb-2">
        <img src="${
          data.avatar
        }" class="avatar me-2" style="width: 32px; height: 32px; border-radius: 50%;" />
        <strong>${data.username}</strong>
      </div>
      <p id="content-${postId}">${data.content}</p>
      <div class="d-flex align-items-center gap-2 mt-2">
        <button class="btn btn-sm ${
          liked ? "btn-danger" : "btn-outline-danger"
        }" onclick="toggleLike('${postId}')">
          ❤️ Thích (${(data.likes || []).length})
        </button>
      </div>
    </div>
  `;
  userPostsDiv.appendChild(div);
}
window.editPost = async function (id) {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);
  const oldContent = snap.data()?.content || "";
  const newContent = prompt("Nội dung mới:", oldContent);
  if (newContent && newContent !== oldContent) {
    await updateDoc(ref, { content: newContent });
  }
};

window.deletePost = async function (id) {
  if (confirm("Xác nhận xoá bài viết?")) {
    await deleteDoc(doc(db, "posts", id));
  }
};

window.toggleLike = async function (postId) {
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(postRef);
  const data = snap.data();
  let likes = data.likes || [];

  const index = likes.indexOf(currentUser.email);
  if (index >= 0) {
    likes.splice(index, 1);
  } else {
    likes.push(currentUser.email);
  }

  await updateDoc(postRef, { likes });
};
const userPostQuery = query(
  collection(db, "posts"),
  where("author", "==", currentUser.email),
  orderBy("createdAt", "desc")
);

onSnapshot(userPostQuery, (snapshot) => {
  userPostsDiv.innerHTML = "";
  snapshot.forEach(renderPost);
});
async function updateAllUsernames() {
  const postsSnap = await getDocs(collection(db, "posts"));
  for (const post of postsSnap.docs) {
    const postData = post.data();

    // Bài viết của user
    if (
      postData.author === currentUser.email &&
      postData.username !== currentUser.username
    ) {
      await updateDoc(post.ref, { username: currentUser.username });
    }

    // Cập nhật comment
    const commentsSnap = await getDocs(collection(post.ref, "comments"));
    for (const comment of commentsSnap.docs) {
      const cData = comment.data();

      if (
        cData.author === currentUser.email &&
        cData.username !== currentUser.username
      ) {
        await updateDoc(comment.ref, { username: currentUser.username });
      }

      const repliesSnap = await getDocs(collection(comment.ref, "replies"));
      for (const reply of repliesSnap.docs) {
        const rData = reply.data();
        if (
          rData.author === currentUser.email &&
          rData.username !== currentUser.username
        ) {
          await updateDoc(reply.ref, { username: currentUser.username });
        }
      }
    }
  }

  // Cập nhật chat
  const chatSnap = await getDocs(
    query(collection(db, "globalChat"), where("user", "==", currentUser.email))
  );
  for (const docSnap of chatSnap.docs) {
    await updateDoc(docSnap.ref, {
      username: currentUser.username,
      avatar: currentUser.avatar,
    });
  }
}

////////////////
const chatQuery = query(
  collection(db, "globalChat"),
  where("user", "==", currentUser.email)
);
const chatSnap = await getDocs(chatQuery);
for (const docSnap of chatSnap.docs) {
  await updateDoc(docSnap.ref, {
    username: currentUser.username,
    avatar: currentUser.avatar,
  });
}

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
