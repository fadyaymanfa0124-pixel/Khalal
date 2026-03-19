const albumData = {
  title: "Khalal",
  subtitle: "FUF",
  description: "صفحة دخول للألبوم بروح قريبة من الأرت وورك: هادئة، ضبابية، ومركزة على الروابط الأساسية.",
  links: [
    {
      title: "YouTube",
      note: "الاستماع إلى الألبوم على يوتيوب.",
      url: "https://www.youtube.com/playlist?list=OLAK5uy_k0L5rD398dtFZki_NXFLJKkeXYY5fGPD4",
      cta: "Open YouTube"
    },
    {
      title: "Anghami",
      note: "الاستماع إلى الألبوم على أنغامي.",
      url: "https://play.anghami.com/album/1084586484",
      cta: "Open Anghami"
    },
    {
      title: "Deezer",
      note: "الاستماع إلى الألبوم على ديزر.",
      url: "https://www.deezer.com/en/album/925308961",
      cta: "Open Deezer"
    },
    {
      title: "Amazon Music",
      note: "الاستماع إلى الألبوم على أمازون ميوزك.",
      url: "https://amazon.com/music/player/albums/B0GPQLMFWW?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_sXZmz3pXyEAvcQEyH4c5zv36j",
      cta: "Open Amazon"
    }
  ],
  tracks: [
    {
      title: "1.A5erha Eh (intro) 1",
      src: "track-01.mp3"
    },
    {
      title: "2.Dam Bared",
      src: "track-02.mp3"
    },
    {
      title: "3.Tale3 deen ommy",
      src: "track-03.mp3"
    }
  ]
};

const titleElement = document.getElementById("album-title");
const subtitleElement = document.getElementById("album-subtitle");
const descriptionElement = document.getElementById("album-description");
const linksContainer = document.getElementById("links-container");
const trackNameElement = document.getElementById("track-name");
const trackStatusElement = document.getElementById("track-status");
const audioPlayer = document.getElementById("audio-player");
const playButton = document.getElementById("play-button");
const progressBar = document.querySelector(".track-progress");
const progressKnob = document.querySelector(".track-knob");

let currentTrackIndex = -1;
let hasPlayableTracks = albumData.tracks.length > 0;

titleElement.textContent = albumData.title;
subtitleElement.textContent = albumData.subtitle;
descriptionElement.textContent = albumData.description;

albumData.links.forEach((link) => {
  const item = document.createElement("article");
  item.className = "link-item";

  item.innerHTML = `
    <h3 class="link-title">${link.title}</h3>
    <p class="link-note">${link.note}</p>
    <a class="link-button" href="${link.url}" target="_blank" rel="noreferrer">${link.cta}</a>
  `;

  linksContainer.appendChild(item);
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateProgress = () => {
  if (!audioPlayer.duration || Number.isNaN(audioPlayer.duration)) {
    progressBar.style.inset = "0 42% 0 0";
    progressKnob.style.left = "58%";
    return;
  }

  const progress = clamp((audioPlayer.currentTime / audioPlayer.duration) * 100, 0, 100);
  progressBar.style.inset = `0 ${100 - progress}% 0 0`;
  progressKnob.style.left = `${progress}%`;
};

const updatePlayButton = (isPlaying) => {
  playButton.textContent = isPlaying ? "II" : "▶";
  playButton.setAttribute("aria-label", isPlaying ? "إيقاف" : "تشغيل");
};

const updateTrackMeta = (message) => {
  if (!hasPlayableTracks) {
    trackNameElement.textContent = "Waiting For Tracks";
    trackStatusElement.textContent = "ابعتي روابط أو ملفات MP3 للتراكات وسأربطها فوراً. حالياً الروابط الخارجية فقط شغالة.";
    return;
  }

  trackNameElement.textContent = albumData.tracks[currentTrackIndex]?.title || "Random Track";
  trackStatusElement.textContent = message;
};

const setControlsDisabledState = (disabled) => {
  playButton.disabled = disabled;
};

const chooseRandomIndex = (excludeIndex = -1) => {
  if (albumData.tracks.length === 1) {
    return 0;
  }

  let nextIndex = excludeIndex;

  while (nextIndex === excludeIndex) {
    nextIndex = Math.floor(Math.random() * albumData.tracks.length);
  }

  return nextIndex;
};

const loadTrack = (index, autoplay = false, reason = "جاهز للتشغيل") => {
  if (!hasPlayableTracks) {
    return;
  }

  currentTrackIndex = index;
  audioPlayer.src = albumData.tracks[index].src;
  audioPlayer.load();
  updateTrackMeta(reason);
  updateProgress();

  if (autoplay) {
    audioPlayer.play().then(() => {
      updatePlayButton(true);
      updateTrackMeta("يعمل الآن");
    }).catch(() => {
      updatePlayButton(false);
      updateTrackMeta("ملف التراك غير موجود بعد. ضعي ملف الصوت بجانب ملفات الموقع أو استخدمي رابطا مباشرا داخل src.");
    });
  } else {
    updatePlayButton(false);
  }
};

const loadRandomTrack = (autoplay = false) => {
  if (!hasPlayableTracks) {
    return;
  }

  const randomIndex = chooseRandomIndex(currentTrackIndex);
  loadTrack(randomIndex, autoplay, "تم اختيار تراك عشوائي");
};

if (hasPlayableTracks) {
  loadRandomTrack(false);
  setControlsDisabledState(false);
} else {
  setControlsDisabledState(true);
  updateTrackMeta("");
}

playButton.addEventListener("click", async () => {
  if (!hasPlayableTracks) {
    return;
  }

  if (currentTrackIndex === -1) {
    loadRandomTrack(true);
    return;
  }

  if (audioPlayer.paused) {
    try {
      await audioPlayer.play();
      updatePlayButton(true);
      updateTrackMeta("يعمل الآن");
    } catch {
      updateTrackMeta("ملف التراك غير موجود بعد. ضعي ملف الصوت بجانب ملفات الموقع أو استخدمي رابطا مباشرا داخل src.");
    }
  } else {
    audioPlayer.pause();
    updatePlayButton(false);
    updateTrackMeta("متوقف مؤقتاً");
  }
});

audioPlayer.addEventListener("timeupdate", updateProgress);
audioPlayer.addEventListener("ended", () => loadRandomTrack(true));
audioPlayer.addEventListener("play", () => updatePlayButton(true));
audioPlayer.addEventListener("pause", () => updatePlayButton(false));
