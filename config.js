// config.js — ALL KEYS

// === Supabase ===
const SUPABASE_URL = "https://nmikmavpfuieceypuzft.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tjB-ZUELnoUgmknD8JTL6g_-R5BszAh";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === Firebase ===
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDjCwfUlDa4aXBFUpjL17fXHHfVain615k",
  authDomain: "societybazaar-e31df.firebaseapp.com",
  projectId: "societybazaar-e31df",
  storageBucket: "societybazaar-e31df.firebasestorage.app",
  messagingSenderId: "311712324164",
  appId: "1:311712324164:web:204b8b6105642f15c5fa11"
};

const FIREBASE_VAPID_KEY = "BGbiMWDJM9mzx7eAnPmyXF-NPrj9jqUOjDOYSBaTPaLf6R6TG5BrcVK_MMBBnbQ5ZSyMv7btWOGKVOU5RLvmmFQ";