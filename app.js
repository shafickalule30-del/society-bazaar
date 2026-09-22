// app.js — Feed logic

async function loadPosts() {
  const feed = document.getElementById("feed");

  try {
    const { data, error } = await supabaseClient
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      feed.innerHTML = `<div class="empty">⚠️ Could not load products.<br><small>${error.message}</small></div>`;
      return;
    }

    if (!data || data.length === 0) {
      feed.innerHTML = `<div class="empty">🛒 No products yet.<br>Check back soon!</div>`;
      return;
    }

    feed.innerHTML = data.map(post => renderCard(post)).join("");
  } catch (err) {
    console.error("Unexpected error:", err);
    feed.innerHTML = `<div class="empty">⚠️ Something went wrong.</div>`;
  }
}

function renderCard(post) {
  const imageHtml = post.image_url
    ? `<img class="card-image" src="${post.image_url}" alt="${escapeHtml(post.title)}" onerror="this.outerHTML='<div class=\\'card-image-placeholder\\'>🛒</div>'">`
    : `<div class="card-image-placeholder">🛒</div>`;

  const waNumber = (post.whatsapp || "").replace(/[^0-9]/g, "");
  const waMessage = encodeURIComponent(
    `Hi ${post.seller}, I saw your listing "${post.title}" on Society Bazaar. I'd like to order.`
  );
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waMessage}`
    : "#";

  return `
    <article class="card">
      ${imageHtml}
      <div class="card-body">
        <div class="card-title">${escapeHtml(post.title || "")}</div>
        <div class="card-price">${escapeHtml(post.price || "")}</div>
        <div class="card-seller">By ${escapeHtml(post.seller || "Unknown")}</div>
        ${post.description ? `<div class="card-desc">${escapeHtml(post.description)}</div>` : ""}
        <a class="card-btn" href="${waLink}" target="_blank" rel="noopener">Order on WhatsApp</a>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function enableNotifications() {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    const messaging = firebase.messaging();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("You need to allow notifications to get updates.");
      return;
    }

    const token = await messaging.getToken({
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      alert("Could not get notification token. Try again.");
      return;
    }

    const { error } = await supabaseClient
  .from("subscribers")
  .insert([{ fcm_token: token }]);

if (error) {
  console.error("Save subscriber error:", error);
  alert("Token was generated but failed to save: " + error.message);
  return;
        }

    document.getElementById("notify-banner").style.display = "none";
    alert("✅ Notifications enabled! You'll get alerts for new products.");

  } catch (err) {
    console.error("Notification setup error:", err);
    alert("Notification setup failed: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    document.getElementById("notify-banner").style.display = "flex";
  }

  const timer = setTimeout(() => {
    const feed = document.getElementById("feed");
    if (feed && feed.innerHTML.includes("Loading")) {
      feed.innerHTML = `<div class="empty">⚠️ Timed out loading.<br><small>Check RLS policies or config.js</small></div>`;
    }
  }, 8000);

  loadPosts().finally(() => clearTimeout(timer));
});
