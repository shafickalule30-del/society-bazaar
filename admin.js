// === Cloudinary config ===
const CLOUDINARY_CLOUD_NAME = "iv2cmmrt";
const CLOUDINARY_UPLOAD_PRESET = "society_bazaar";
// admin.js — Admin panel logic

document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.getElementById("submit-btn");
  const status = document.getElementById("status-msg");

  // Get values
  const title = document.getElementById("title").value.trim();
  const price = document.getElementById("price").value.trim();
  const seller = document.getElementById("seller").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const description = document.getElementById("description").value.trim();
  const image_url = document.getElementById("image_url").value.trim();

  // Basic validation
  if (!title || !price || !seller || !whatsapp) {
    showStatus("Please fill all required fields.", "error");
    return;
  }

  // Disable button while saving
  btn.disabled = true;
  btn.textContent = "Posting…";
  status.className = "status-msg";
  status.style.display = "none";

  try {
    const { data, error } = await supabaseClient
      .from("posts")
      .insert([
        {
          title,
          price,
          seller,
          whatsapp,
          description: description || null,
          image_url: image_url || null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      showStatus("❌ Error: " + error.message, "error");
      btn.disabled = false;
      btn.textContent = "Post Product";
      return;
    }

    // Success!
    showStatus("✅ Posted! Residents will see it in the feed.", "success");
    document.getElementById("post-form").reset();

    // In Batch C, we'll also trigger a push notification here.

  } catch (err) {
    console.error("Unexpected error:", err);
    showStatus("❌ Something went wrong: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Post Product";
  }
});

function showStatus(msg, type) {
  const status = document.getElementById("status-msg");
  status.textContent = msg;
  status.className = "status-msg " + type;
  status.style.display = "block";
}
// === Image upload logic ===
const imageFile = document.getElementById("image_file");
const pickBtn = document.getElementById("pick-image-btn");
const previewBox = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const removeBtn = document.getElementById("remove-image-btn");
const imageUrlInput = document.getElementById("image_url");
const uploadStatus = document.getElementById("upload-status");

pickBtn.addEventListener("click", () => imageFile.click());

imageFile.addEventListener("change", async () => {
  const file = imageFile.files[0];
  if (!file) return;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewBox.style.display = "block";
  };
  reader.readAsDataURL(file);

  // Upload to Cloudinary
  uploadStatus.textContent = "⏳ Uploading image…";
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();

    if (data.secure_url) {
      imageUrlInput.value = data.secure_url;
      uploadStatus.textContent = "✅ Image uploaded";
      uploadStatus.style.color = "#155724";
    } else {
      uploadStatus.textContent = "❌ Upload failed: " + (data.error?.message || "unknown");
      uploadStatus.style.color = "#721c24";
    }
  } catch (err) {
    uploadStatus.textContent = "❌ Upload error: " + err.message;
    uploadStatus.style.color = "#721c24";
  }
});

removeBtn.addEventListener("click", () => {
  imageFile.value = "";
  imageUrlInput.value = "";
  previewBox.style.display = "none";
  uploadStatus.textContent = "";
});