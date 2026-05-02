const ALBUMS_STORAGE_KEY = "khalal_albums_hub_v2";
const FIXED_ADMIN_PASSWORD = "2007193";

const defaultPalette = {
  primary: "184 110 52",
  secondary: "84 52 36",
  accent: "243 204 111",
  shadow: "11 14 20"
};

const root = document.documentElement;
const pageBody = document.body;
const themeTransition = document.getElementById("theme-transition");

const seedAlbum = {
  id: createId(),
  title: "Khalal",
  subtitle: "FUF",
  description: "روابط المنصات المتوفر عليها الألبوم في مكان واحد.",
  cover: createPlaceholderCover("Khalal", "FUF", defaultPalette),
  palette: { ...defaultPalette },
  links: [
    { label: "YouTube", url: "https://www.youtube.com/playlist?list=OLAK5uy_k0L5rD398dtFZki_NXFLJKkeXYY5fGPD4" },
    { label: "Anghami", url: "https://play.anghami.com/album/1084586484" },
    { label: "Deezer", url: "https://www.deezer.com/en/album/925308961" },
    { label: "Amazon Music", url: "https://amazon.com/music/player/albums/B0GPQLMFWW?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_sXZmz3pXyEAvcQEyH4c5zv36j" }
  ]
};

const albumsGrid = document.getElementById("albums-grid");
const albumOverlay = document.getElementById("album-overlay");
const albumClose = document.getElementById("album-close");
const modalCover = document.getElementById("modal-cover");
const modalTitle = document.getElementById("modal-title");
const modalSubtitle = document.getElementById("modal-subtitle");
const modalDescription = document.getElementById("modal-description");
const modalLinks = document.getElementById("modal-links");
const adminEntry = document.getElementById("admin-entry");
const authOverlay = document.getElementById("auth-overlay");
const authClose = document.getElementById("auth-close");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authCopy = document.getElementById("auth-copy");
const authPassword = document.getElementById("auth-password");
const authConfirm = document.getElementById("auth-confirm");
const confirmField = document.getElementById("confirm-field");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const adminOverlay = document.getElementById("admin-overlay");
const adminClose = document.getElementById("admin-close");
const newAlbumButton = document.getElementById("new-album");
const downloadDataButton = document.getElementById("download-data");
const importDataInput = document.getElementById("import-data");
const adminList = document.getElementById("admin-list");
const albumForm = document.getElementById("album-form");
const albumIdInput = document.getElementById("album-id");
const albumTitleInput = document.getElementById("album-title-input");
const albumSubtitleInput = document.getElementById("album-subtitle-input");
const albumDescriptionInput = document.getElementById("album-description-input");
const albumCoverInput = document.getElementById("album-cover-input");
const albumCoverDataInput = document.getElementById("album-cover-data");
const coverPreview = document.getElementById("cover-preview");
const linkRows = document.getElementById("link-rows");
const addLinkButton = document.getElementById("add-link");
const deleteAlbumButton = document.getElementById("delete-album");
const formStatus = document.getElementById("form-status");

let albums = loadAlbums();
let selectedAlbumId = albums[0]?.id || null;
let editingAlbumId = albums[0]?.id || null;
let themePulseTimer = 0;
let themeShiftTimer = 0;
let lastThemeSignature = "";

renderAll({ animateTheme: false });
hydratePalettes();
bindEvents();

function bindEvents() {
  adminEntry.addEventListener("click", openAuthFlow);
  authClose.addEventListener("click", () => toggleOverlay(authOverlay, false));
  albumClose.addEventListener("click", () => toggleOverlay(albumOverlay, false));
  adminClose.addEventListener("click", () => toggleOverlay(adminOverlay, false));
  authForm.addEventListener("submit", handleAuthSubmit);
  newAlbumButton.addEventListener("click", () => {
    const nextAlbum = createBlankAlbum();
    fillForm(nextAlbum, true);
    renderAdminList();
    applyTheme(nextAlbum.palette || defaultPalette, { animate: true, force: true });
    setFormStatus("ألبوم جديد جاهز للإضافة.");
  });
  albumForm.addEventListener("submit", handleAlbumSave);
  addLinkButton.addEventListener("click", () => addLinkRow());
  deleteAlbumButton.addEventListener("click", handleDeleteAlbum);
  albumCoverInput.addEventListener("change", handleCoverUpload);
  downloadDataButton.addEventListener("click", downloadAlbumsBackup);
  importDataInput.addEventListener("change", handleImportData);

  document.querySelectorAll("[data-close]").forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
      const targetId = event.currentTarget.getAttribute("data-close");
      const target = document.getElementById(targetId);
      if (target) {
        toggleOverlay(target, false);
      }
    });
  });

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", resetPointerLight, { passive: true });
  window.addEventListener("keydown", handleEscapeKey);
}

function renderAll(options = {}) {
  const { animateTheme = false } = options;

  renderAlbumsGrid();
  renderAdminList();

  const currentAlbum = albums.find((album) => album.id === editingAlbumId) || albums[0] || createBlankAlbum();
  fillForm(currentAlbum, !albums.some((album) => album.id === currentAlbum.id));
  applyTheme(currentAlbum.palette || defaultPalette, { animate: animateTheme });
}

function renderAlbumsGrid() {
  albumsGrid.innerHTML = "";

  if (!albums.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "لا توجد ألبومات بعد. ادخل الإدارة وأضف أول ألبوم.";
    albumsGrid.appendChild(empty);
    return;
  }

  albums.forEach((album) => {
    const palette = resolvePalette(album.palette);
    const card = document.createElement("article");
    card.className = "album-card";
    card.style.setProperty("--card-primary", palette.primary);
    card.style.setProperty("--card-secondary", palette.secondary);
    card.style.setProperty("--card-accent", palette.accent);

    card.innerHTML = `
      <button class="album-card__button" type="button" data-album-id="${album.id}">
        <div class="album-card__cover">
          <img src="${album.cover}" alt="${escapeHtml(album.title)}">
        </div>
        <div class="album-card__meta">
          <h2 class="album-card__title">${escapeHtml(album.title)}</h2>
          <p class="album-card__subtitle">${escapeHtml(album.subtitle || "بدون ساب تايتل")}</p>
          <span class="album-card__availability">${album.links.length} منصة</span>
        </div>
      </button>
    `;

    const button = card.querySelector(".album-card__button");
    const previewTheme = () => applyTheme(palette, { animate: true });
    const restoreTheme = () => applyTheme(getCurrentInterfacePalette(), { animate: false, force: true });

    button.addEventListener("click", () => openAlbum(album.id));
    button.addEventListener("mouseenter", previewTheme);
    button.addEventListener("mouseleave", restoreTheme);
    button.addEventListener("focus", previewTheme);
    button.addEventListener("blur", restoreTheme);

    albumsGrid.appendChild(card);
  });
}

function openAlbum(albumId) {
  const album = albums.find((item) => item.id === albumId);
  if (!album) {
    return;
  }

  selectedAlbumId = album.id;
  applyTheme(album.palette || defaultPalette, { animate: true, force: true });
  modalCover.src = album.cover;
  modalCover.alt = album.title;
  modalTitle.textContent = album.title;
  modalSubtitle.textContent = album.subtitle || "روابط الألبوم";
  modalDescription.textContent = album.description || "اختر المنصة التي تريد فتح الألبوم عليها.";
  modalLinks.innerHTML = "";

  album.links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "link-button";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = link.label;
    modalLinks.appendChild(anchor);
  });

  toggleOverlay(albumOverlay, true);
}

function renderAdminList() {
  adminList.innerHTML = "";

  if (!albums.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "لا توجد ألبومات محفوظة حالياً.";
    adminList.appendChild(empty);
    return;
  }

  albums.forEach((album) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `admin-list__item${album.id === editingAlbumId ? " is-active" : ""}`;
    item.innerHTML = `
      <span class="admin-list__cover">
        <img src="${album.cover}" alt="${escapeHtml(album.title)}">
      </span>
      <span class="admin-list__meta">
        <span class="admin-list__title">${escapeHtml(album.title)}</span>
        <span class="admin-list__subtitle">${escapeHtml(album.subtitle || "بدون ساب تايتل")}</span>
      </span>
      <span class="admin-list__count">${album.links.length}</span>
    `;

    const previewTheme = () => applyTheme(album.palette || defaultPalette, { animate: true });
    const restoreTheme = () => applyTheme(getCurrentInterfacePalette(), { animate: false, force: true });

    item.addEventListener("click", () => {
      editingAlbumId = album.id;
      fillForm(album, false);
      renderAdminList();
      applyTheme(album.palette || defaultPalette, { animate: true, force: true });
      setFormStatus("تم تحميل الألبوم للتعديل.");
    });
    item.addEventListener("mouseenter", previewTheme);
    item.addEventListener("mouseleave", restoreTheme);
    item.addEventListener("focus", previewTheme);
    item.addEventListener("blur", restoreTheme);

    adminList.appendChild(item);
  });
}

function fillForm(album, isNewAlbum) {
  editingAlbumId = album.id;
  albumIdInput.value = isNewAlbum ? "" : album.id;
  albumTitleInput.value = album.title || "";
  albumSubtitleInput.value = album.subtitle || "";
  albumDescriptionInput.value = album.description || "";
  albumCoverDataInput.value = album.cover || "";
  albumCoverInput.value = "";
  renderCoverPreview(album.cover || "");
  renderLinkRows(album.links?.length ? album.links : createPresetLinks());
  deleteAlbumButton.disabled = isNewAlbum || !albums.length;
}

function renderLinkRows(links) {
  linkRows.innerHTML = "";
  links.forEach((link) => addLinkRow(link));
}

function addLinkRow(link = { label: "", url: "" }) {
  const row = document.createElement("div");
  row.className = "link-row";
  row.innerHTML = `
    <input type="text" class="link-label" placeholder="اسم المنصة" value="${escapeAttribute(link.label)}">
    <input type="url" class="link-url" placeholder="https://example.com" value="${escapeAttribute(link.url)}">
    <button type="button" class="remove-link" aria-label="حذف الرابط">×</button>
  `;

  row.querySelector(".remove-link").addEventListener("click", () => row.remove());
  linkRows.appendChild(row);
}

function openAuthFlow() {
  authTitle.textContent = "أدخل كلمة مرور الإدارة";
  authCopy.textContent = "اكتب كلمة المرور لفتح لوحة إدارة الألبومات.";
  authSubmit.textContent = "دخول الإدارة";
  confirmField.classList.add("hidden");
  authPassword.value = "";
  authConfirm.value = "";
  authStatus.textContent = "";
  toggleOverlay(authOverlay, true);
  window.setTimeout(() => authPassword.focus(), 60);
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const password = authPassword.value.trim();

  if (!password) {
    authStatus.textContent = "اكتب كلمة مرور أولاً.";
    return;
  }

  if (password !== FIXED_ADMIN_PASSWORD) {
    authStatus.textContent = "كلمة المرور غير صحيحة.";
    return;
  }

  toggleOverlay(authOverlay, false);
  toggleOverlay(adminOverlay, true);
  window.setTimeout(() => albumTitleInput.focus(), 60);
}

async function handleAlbumSave(event) {
  event.preventDefault();
  const title = albumTitleInput.value.trim();
  const subtitle = albumSubtitleInput.value.trim();
  const description = albumDescriptionInput.value.trim();
  const cover = albumCoverDataInput.value.trim();
  const links = collectLinks();

  if (!title) {
    setFormStatus("اسم الألبوم مطلوب.");
    return;
  }

  if (!cover) {
    setFormStatus("ارفع صورة غلاف أولاً.");
    return;
  }

  if (!links.length) {
    setFormStatus("أضف رابط منصة واحد على الأقل.");
    return;
  }

  const palette = await extractPalette(cover);
  const album = {
    id: albumIdInput.value || createId(),
    title,
    subtitle,
    description,
    cover,
    palette,
    links
  };

  const existingIndex = albums.findIndex((item) => item.id === album.id);
  if (existingIndex >= 0) {
    albums[existingIndex] = album;
  } else {
    albums.unshift(album);
  }

  albums = sanitizeAlbums(albums);
  editingAlbumId = album.id;
  selectedAlbumId = album.id;
  persistAlbums();
  renderAll({ animateTheme: true });
  setFormStatus("تم حفظ الألبوم بنجاح.");
}

function handleDeleteAlbum() {
  if (!albumIdInput.value) {
    setFormStatus("لا يوجد ألبوم محدد للحذف.");
    return;
  }

  albums = albums.filter((album) => album.id !== albumIdInput.value);
  persistAlbums();

  if (!albums.length) {
    editingAlbumId = null;
    selectedAlbumId = null;
    renderAlbumsGrid();
    renderAdminList();
    fillForm(createBlankAlbum(), true);
    applyTheme(defaultPalette, { animate: true, force: true });
  } else {
    editingAlbumId = albums[0].id;
    selectedAlbumId = albums[0].id;
    renderAll({ animateTheme: true });
  }

  setFormStatus("تم حذف الألبوم.");
}

async function handleCoverUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const dataUrl = await resizeImage(file);
  const palette = await extractPalette(dataUrl);
  albumCoverDataInput.value = dataUrl;
  renderCoverPreview(dataUrl);
  applyTheme(palette, { animate: true, force: true });
  setFormStatus("تم رفع الصورة وتحديث الثيم التلقائي.");
}

function renderCoverPreview(source) {
  coverPreview.innerHTML = source ? `<img src="${source}" alt="معاينة الغلاف">` : "<span>لا توجد صورة بعد</span>";
}

function collectLinks() {
  return Array.from(linkRows.querySelectorAll(".link-row"))
    .map((row) => ({
      label: row.querySelector(".link-label")?.value.trim() || "",
      url: row.querySelector(".link-url")?.value.trim() || ""
    }))
    .filter((link) => link.label && link.url);
}

function createPresetLinks() {
  return [
    { label: "YouTube", url: "" },
    { label: "Anghami", url: "" },
    { label: "Deezer", url: "" },
    { label: "Amazon Music", url: "" }
  ];
}

function createBlankAlbum() {
  return {
    id: createId(),
    title: "",
    subtitle: "",
    description: "",
    cover: createPlaceholderCover("New Album", "Add Cover", defaultPalette),
    palette: { ...defaultPalette },
    links: createPresetLinks()
  };
}

function loadAlbums() {
  const stored = localStorage.getItem(ALBUMS_STORAGE_KEY);
  if (!stored) {
    return [seedAlbum];
  }

  try {
    return sanitizeAlbums(JSON.parse(stored));
  } catch {
    return [seedAlbum];
  }
}

function sanitizeAlbums(source) {
  if (!Array.isArray(source) || !source.length) {
    return [seedAlbum];
  }

  return source
    .filter((album) => album && album.title)
    .map((album) => ({
      id: album.id || createId(),
      title: album.title,
      subtitle: album.subtitle || "",
      description: album.description || "",
      cover: album.cover || createPlaceholderCover(album.title, album.subtitle || "", defaultPalette),
      palette: resolvePalette(album.palette),
      links: Array.isArray(album.links) ? album.links.filter((link) => link?.label && link?.url) : []
    }));
}

function persistAlbums() {
  localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(albums));
}

async function hydratePalettes() {
  let changed = false;

  for (const album of albums) {
    if (!album.palette || !album.palette.primary) {
      album.palette = await extractPalette(album.cover);
      changed = true;
    }
  }

  if (changed) {
    persistAlbums();
    renderAll({ animateTheme: false });
  }
}

function applyTheme(palette, options = {}) {
  const { animate = true, force = false } = options;
  const target = resolvePalette(palette);
  const signature = getPaletteSignature(target);

  if (!force && signature === lastThemeSignature) {
    setThemeVariables(target);
    return;
  }

  if (animate && lastThemeSignature) {
    triggerThemeTransition(target);
  }

  setThemeVariables(target);
  lastThemeSignature = signature;
}

function setThemeVariables(palette) {
  root.style.setProperty("--theme-primary", palette.primary);
  root.style.setProperty("--theme-secondary", palette.secondary);
  root.style.setProperty("--theme-accent", palette.accent);
  root.style.setProperty("--theme-shadow", palette.shadow);
}

function triggerThemeTransition(palette) {
  root.style.setProperty("--transition-primary", palette.primary);
  root.style.setProperty("--transition-secondary", palette.secondary);
  root.style.setProperty("--transition-accent", palette.accent);

  window.clearTimeout(themePulseTimer);
  window.clearTimeout(themeShiftTimer);
  themeTransition.classList.remove("is-active");
  pageBody.classList.remove("theme-shifting");

  void themeTransition.offsetWidth;

  themeTransition.classList.add("is-active");
  pageBody.classList.add("theme-shifting");

  themePulseTimer = window.setTimeout(() => {
    themeTransition.classList.remove("is-active");
  }, 840);

  themeShiftTimer = window.setTimeout(() => {
    pageBody.classList.remove("theme-shifting");
  }, 900);
}

function resolvePalette(palette) {
  return {
    primary: palette?.primary || defaultPalette.primary,
    secondary: palette?.secondary || defaultPalette.secondary,
    accent: palette?.accent || defaultPalette.accent,
    shadow: palette?.shadow || defaultPalette.shadow
  };
}

function getPaletteSignature(palette) {
  const target = resolvePalette(palette);
  return `${target.primary}|${target.secondary}|${target.accent}|${target.shadow}`;
}

function getCurrentInterfacePalette() {
  if (!adminOverlay.classList.contains("hidden")) {
    const album = albums.find((item) => item.id === editingAlbumId);
    if (album) {
      return resolvePalette(album.palette);
    }
  }

  if (!albumOverlay.classList.contains("hidden")) {
    const album = albums.find((item) => item.id === selectedAlbumId);
    if (album) {
      return resolvePalette(album.palette);
    }
  }

  const fallback = albums.find((item) => item.id === selectedAlbumId) || albums[0];
  return resolvePalette(fallback?.palette);
}

function toggleOverlay(target, show) {
  target.classList.toggle("hidden", !show);
  const hasVisibleOverlay = [albumOverlay, authOverlay, adminOverlay].some((overlay) => !overlay.classList.contains("hidden"));
  pageBody.style.overflow = hasVisibleOverlay ? "hidden" : "";
}

function setFormStatus(message) {
  formStatus.textContent = message;
}

function downloadAlbumsBackup() {
  const blob = new Blob([JSON.stringify(albums, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "albums-hub-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
  setFormStatus("تم تنزيل نسخة من البيانات.");
}

async function handleImportData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    albums = sanitizeAlbums(JSON.parse(await file.text()));
    persistAlbums();
    editingAlbumId = albums[0]?.id || null;
    selectedAlbumId = albums[0]?.id || null;
    renderAll({ animateTheme: true });
    setFormStatus("تم استيراد البيانات بنجاح.");
  } catch {
    setFormStatus("ملف الاستيراد غير صالح.");
  }

  importDataInput.value = "";
}

function handlePointerMove(event) {
  root.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth) * 100}%`);
  root.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight) * 100}%`);
}

function resetPointerLight() {
  root.style.setProperty("--pointer-x", "50%");
  root.style.setProperty("--pointer-y", "50%");
}

function handleEscapeKey(event) {
  if (event.key !== "Escape") {
    return;
  }

  if (!adminOverlay.classList.contains("hidden")) {
    toggleOverlay(adminOverlay, false);
    return;
  }

  if (!authOverlay.classList.contains("hidden")) {
    toggleOverlay(authOverlay, false);
    return;
  }

  if (!albumOverlay.classList.contains("hidden")) {
    toggleOverlay(albumOverlay, false);
  }
}

function createId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `album-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

async function resizeImage(file) {
  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(rawDataUrl);
  const canvas = document.createElement("canvas");
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function extractPalette(source) {
  try {
    const image = await loadImage(source);
    const canvas = document.createElement("canvas");
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, size, size);
    const { data } = context.getImageData(0, 0, size, size);

    let average = { r: 0, g: 0, b: 0, w: 0 };
    let vivid = { r: 0, g: 0, b: 0, w: 0 };
    let light = { r: 0, g: 0, b: 0, w: 0 };
    let dark = { r: 0, g: 0, b: 0, w: 0 };

    for (let index = 0; index < data.length; index += 4) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const alpha = data[index + 3] / 255;
      if (alpha < 0.5) {
        continue;
      }

      const brightness = (r + g + b) / 3;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      addWeightedColor(average, r, g, b, 1);
      addWeightedColor(vivid, r, g, b, Math.max(0.1, saturation * (1 - Math.abs(brightness - 145) / 145)));
      if (brightness > 150) addWeightedColor(light, r, g, b, 1 + saturation);
      if (brightness < 120) addWeightedColor(dark, r, g, b, 1 + (1 - brightness / 120));
    }

    const averageColor = normalizeWeightedColor(average, { r: 184, g: 110, b: 52 });
    const vividColor = normalizeWeightedColor(vivid, averageColor);
    const lightColor = normalizeWeightedColor(light, mixColors(averageColor, { r: 255, g: 222, b: 152 }, 0.55));
    const darkColor = normalizeWeightedColor(dark, mixColors(averageColor, { r: 12, g: 15, b: 20 }, 0.7));

    return {
      primary: colorToCss(mixColors(averageColor, vividColor, 0.28)),
      secondary: colorToCss(mixColors(darkColor, averageColor, 0.18)),
      accent: colorToCss(mixColors(lightColor, vividColor, 0.42)),
      shadow: colorToCss(mixColors(darkColor, { r: 8, g: 10, b: 14 }, 0.52))
    };
  } catch {
    return { ...defaultPalette };
  }
}

function addWeightedColor(target, r, g, b, weight) {
  target.r += r * weight;
  target.g += g * weight;
  target.b += b * weight;
  target.w += weight;
}

function normalizeWeightedColor(source, fallback) {
  if (!source.w) {
    return fallback;
  }

  return {
    r: Math.round(source.r / source.w),
    g: Math.round(source.g / source.w),
    b: Math.round(source.b / source.w)
  };
}

function mixColors(first, second, amount) {
  const ratio = Math.max(0, Math.min(1, amount));
  return {
    r: Math.round(first.r + (second.r - first.r) * ratio),
    g: Math.round(first.g + (second.g - first.g) * ratio),
    b: Math.round(first.b + (second.b - first.b) * ratio)
  };
}

function colorToCss(color) {
  return `${color.r} ${color.g} ${color.b}`;
}

function createPlaceholderCover(title, subtitle, palette) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgb(${palette.shadow})"/>
          <stop offset="45%" stop-color="rgb(${palette.secondary})"/>
          <stop offset="100%" stop-color="rgb(${palette.primary})"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)"/>
      <ellipse cx="330" cy="270" rx="250" ry="180" fill="rgb(${palette.primary})" fill-opacity="0.48"/>
      <ellipse cx="760" cy="520" rx="320" ry="270" fill="rgb(${palette.accent})" fill-opacity="0.52"/>
      <ellipse cx="980" cy="970" rx="320" ry="250" fill="rgb(${palette.secondary})" fill-opacity="0.45"/>
      <text x="50%" y="52%" fill="rgba(255,248,240,0.95)" font-family="'Special Elite', serif" font-size="108" text-anchor="middle" letter-spacing="26">${escapeSvg(title)}</text>
      <text x="50%" y="64%" fill="rgba(255,248,240,0.88)" font-family="'Special Elite', serif" font-size="62" text-anchor="middle" letter-spacing="18">${escapeSvg(subtitle)}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
