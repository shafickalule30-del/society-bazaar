// api/notify.js — Vercel serverless function
// Sends a push notification to all subscribers

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { createClient } from "@supabase/supabase-js";

// Initialize Firebase Admin (once per cold start)
function initFirebase() {
  if (getApps().length > 0) return;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Initialize Supabase (server-side)
function initSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simple auth — must match your ADMIN_KEY
  const authHeader = req.headers["x-admin-key"];
  if (authHeader !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { post_id, title, body } = req.body;

  if (!post_id || !title) {
    return res.status(400).json({ error: "Missing post_id or title" });
  }

  try {
    initFirebase();
    const supabase = initSupabase();

    // Fetch all subscriber tokens
    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("fcm_token");

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!subscribers || subscribers.length === 0) {
      return res.status(200).json({ sent: 0, message: "No subscribers" });
    }

    const tokens = subscribers.map(s => s.fcm_token).filter(Boolean);

    // Build notification message
    const message = {
      notification: {
        title: title,
        body: body || "New product posted",
      },
      data: {
        post_id: String(post_id),
      },
      webpush: {
        fcmOptions: {
          link: `/post.html?id=${post_id}`,
        },
        notification: {
          icon: "https://via.placeholder.com/192x192/075E54/ffffff?text=SB",
          badge: "https://via.placeholder.com/72x72/075E54/ffffff?text=SB",
          vibrate: [200, 100, 200],
        },
      },
    };

    // Send to all tokens (multicast — up to 500 at once)
    const response = await getMessaging().sendEachForMulticast({
      tokens: tokens,
      ...message,
    });

    // Clean up dead tokens
    const deadTokens = [];
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          deadTokens.push(tokens[i]);
        }
      }
    });

    if (deadTokens.length > 0) {
      await supabase.from("subscribers").delete().in("fcm_token", deadTokens);
    }

    return res.status(200).json({
      sent: response.successCount,
      failed: response.failureCount,
      cleaned: deadTokens.length,
    });

  } catch (err) {
    console.error("Notify error:", err);
    return res.status(500).json({ error: err.message });
  }
}