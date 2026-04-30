const styleNames = {
  clean: "簡潔俐落",
  sleek: "簡潔俐落",
  sweet: "甜美可愛",
  french: "法式浪漫",
  wonder: "童趣異想",
  punk: "清新科技",
};

const styleAliases = {
  sleek: "clean",
};

const defaults = {
  eventTitle: "Party time",
  eventDate: "2026-06-06",
  guestName: "妮妮",
  hostName: "Hans",
  hostEmail: "",
  eventPlace: "台北板橋區",
  cardStyle: "clean",
  timeOptions: ["12:00 - 14:00", "15:00 - 17:00", "18:00 - 20:00"],
  hostMessage: "我想對你說....讓我們一起共同享有一段自在美好的時光。",
};

const creatorView = document.querySelector("#creatorView");
const guestView = document.querySelector("#guestView");
const form = document.querySelector("#inviteForm");
const shareStatus = document.querySelector("#shareStatus");
const responseStatus = document.querySelector("#responseStatus");
const responseSummary = document.querySelector("#responseSummary");
const generatedLinkWrap = document.querySelector("#generatedLinkWrap");
const generatedLink = document.querySelector("#generatedLink");
const copyLinkButton = document.querySelector("#copyLinkButton");
const openGuestButton = document.querySelector("#openGuestButton");
const emailButton = document.querySelector("#emailButton");
const lineButton = document.querySelector("#lineButton");
const sendResponseButton = document.querySelector("#sendResponseButton");
const copyResponseButton = document.querySelector("#copyResponseButton");
const publicDeclineButton = document.querySelector("#publicDeclineButton");

let currentInvite = null;
let currentShareUrl = "";
let publicInvite = null;
let selectedResponse = null;

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeStyle(style) {
  const key = cleanText(style) || defaults.cardStyle;
  return styleAliases[key] || (styleNames[key] ? key : defaults.cardStyle);
}

function getFormData() {
  const formData = new FormData(form);
  return normalizeInvite({
    eventTitle: cleanText(formData.get("eventTitle")),
    eventDate: cleanText(formData.get("eventDate")),
    guestName: cleanText(formData.get("guestName")),
    hostName: cleanText(formData.get("hostName")),
    hostEmail: cleanText(formData.get("hostEmail")),
    eventPlace: cleanText(formData.get("eventPlace")),
    cardStyle: normalizeStyle(formData.get("cardStyle")),
    timeOptions: [
      cleanText(formData.get("timeOption1")),
      cleanText(formData.get("timeOption2")),
      cleanText(formData.get("timeOption3")),
    ],
    hostMessage: cleanText(formData.get("hostMessage")),
  });
}

function normalizeInvite(invite) {
  const merged = { ...defaults, ...invite };
  merged.cardStyle = normalizeStyle(merged.cardStyle);
  merged.eventTitle = cleanText(merged.eventTitle) || defaults.eventTitle;
  merged.eventDate = cleanText(merged.eventDate) || defaults.eventDate;
  merged.guestName = cleanText(merged.guestName);
  merged.hostName = cleanText(merged.hostName) || defaults.hostName;
  merged.hostEmail = cleanText(merged.hostEmail);
  merged.eventPlace = cleanText(merged.eventPlace);
  merged.hostMessage = cleanText(merged.hostMessage) || "我想對你說....";

  const timeOptions = Array.isArray(merged.timeOptions)
    ? merged.timeOptions.slice(0, 3)
    : defaults.timeOptions.slice();

  while (timeOptions.length < 3) {
    timeOptions.push(defaults.timeOptions[timeOptions.length]);
  }

  merged.timeOptions = timeOptions.map((time, index) => {
    return cleanText(time) || defaults.timeOptions[index];
  });

  return merged;
}

function fillInitialValues() {
  document.querySelector("#eventTitle").value = defaults.eventTitle;
  document.querySelector("#eventDate").value = defaults.eventDate;
  document.querySelector("#guestName").value = defaults.guestName;
  document.querySelector("#hostName").value = defaults.hostName;
  document.querySelector("#eventPlace").value = defaults.eventPlace;
  document.querySelector("#timeOption1").value = defaults.timeOptions[0];
  document.querySelector("#timeOption2").value = defaults.timeOptions[1];
  document.querySelector("#timeOption3").value = defaults.timeOptions[2];
  document.querySelector("#hostMessage").value = defaults.hostMessage;
}

function updateCounters() {
  document.querySelectorAll("[data-counter-for]").forEach((counter) => {
    const input = document.querySelector(`#${counter.dataset.counterFor}`);
    if (!input) return;
    counter.textContent = `${input.value.length}/${input.maxLength}`;
  });
}

function formatDate(dateValue) {
  if (!dateValue) return "日期未設定";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year} / ${month} / ${day}（${weekdays[date.getDay()]}）`;
}

function setCardTheme(card, style) {
  card.className = card.className
    .split(" ")
    .filter((name) => !name.startsWith("theme-"))
    .join(" ");
  card.classList.add(`theme-${normalizeStyle(style)}`);
}

function renderCard(invite, target, options = {}) {
  const safeInvite = normalizeInvite(invite);
  const card = document.querySelector(target.card);
  const times = document.querySelector(target.times);

  setCardTheme(card, safeInvite.cardStyle);
  document.querySelector(target.title).textContent = safeInvite.eventTitle;
  document.querySelector(target.date).textContent = formatDate(safeInvite.eventDate);
  document.querySelector(target.place).textContent =
    safeInvite.eventPlace || "地點或活動方式尚未填寫";
  document.querySelector(target.message).textContent = safeInvite.hostMessage;
  document.querySelector(target.host).textContent = safeInvite.hostName
    ? `${safeInvite.hostName} 邀請你`
    : "";

  if (target.guest) {
    document.querySelector(target.guest).textContent = safeInvite.guestName
      ? `給 ${safeInvite.guestName}`
      : "給 你";
  }

  times.replaceChildren(
    ...safeInvite.timeOptions.map((time, index) => {
      if (options.interactive) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "time-card-button";
        button.dataset.responseValue = time;
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = `<span>時間選項 ${index + 1}</span><strong>${escapeHtml(time)}</strong>`;
        button.addEventListener("click", () => {
          selectResponse({
            value: time,
            label: `我可以參加：${time}`,
            attending: true,
          });
        });
        return button;
      }

      const item = document.createElement("span");
      item.className = "time-card";
      item.innerHTML = `<span>時間選項 ${index + 1}</span><strong>${escapeHtml(time)}</strong>`;
      return item;
    }),
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syncPreview() {
  renderCard(getFormData(), {
    card: "#previewCard",
    title: "#previewTitle",
    date: "#previewDate",
    place: "#previewPlace",
    times: "#previewTimes",
    message: "#previewMessage",
    host: "#previewHost",
  });
}

function encodeInvite(invite) {
  const bytes = new TextEncoder().encode(JSON.stringify(invite));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeInvite(encoded) {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function normalizePublicBase(value) {
  const raw = cleanText(value);
  if (!raw) return window.location.href;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("file:///")) return raw;
  return `https://${raw}`;
}

function buildShareUrl(invite) {
  const base = normalizePublicBase(document.querySelector("#publicBaseUrl")?.value);
  const url = new URL(base, window.location.href);
  url.search = `?card=${encodeInvite(invite)}`;
  url.hash = "";
  return url.toString();
}

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function setShareButtonsEnabled(isEnabled) {
  [copyLinkButton, openGuestButton, emailButton, lineButton].forEach((button) => {
    button.disabled = !isEnabled;
  });
}

function markShareStale() {
  if (!currentShareUrl) return;
  currentShareUrl = "";
  generatedLinkWrap.hidden = true;
  generatedLink.value = "";
  setShareButtonsEnabled(false);
  setStatus(shareStatus, "內容已更新，請重新生成邀請卡連結。");
}

function validateInvite(invite) {
  if (!invite.eventTitle) return "請先填寫活動名稱。";
  if (!invite.eventDate) return "請先選擇活動日期。";
  if (!invite.hostName) return "請先填寫邀請人名稱。";
  if (!invite.hostEmail) return "請先填寫接收回覆的 Email。";
  if (!/^\S+@\S+\.\S+$/.test(invite.hostEmail)) return "Email 格式看起來不正確。";
  if (invite.timeOptions.some((time) => !time)) return "請填滿三個可參加時間。";
  return "";
}

async function copyText(text, statusElement, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(statusElement, successMessage);
  } catch {
    setStatus(statusElement, "瀏覽器未允許自動複製，請手動複製欄位中的內容。", true);
  }
}

function openMailTo(to, subject, body) {
  const link = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = link;
}

function composeInviteEmail(invite) {
  return [
    `${invite.guestName || "你好"}，`,
    "",
    `${invite.hostName} 邀請你參加「${invite.eventTitle}」。`,
    `日期：${formatDate(invite.eventDate)}`,
    invite.eventPlace ? `地點或活動方式：${invite.eventPlace}` : "",
    "",
    "請打開邀請卡，選擇可參加時間或回覆無法參加：",
    currentShareUrl,
    "",
    invite.hostMessage ? `邀請人的話：${invite.hostMessage}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function composeLineText(invite) {
  return `${invite.hostName} 邀請你參加「${invite.eventTitle}」，請打開邀請卡回覆可參加時間：`;
}

function initCreator() {
  fillInitialValues();
  updateCounters();
  syncPreview();
  setShareButtonsEnabled(false);

  form.addEventListener("input", () => {
    updateCounters();
    syncPreview();
    markShareStale();
  });

  form.addEventListener("change", () => {
    syncPreview();
    markShareStale();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const invite = getFormData();
    const error = validateInvite(invite);

    if (error) {
      form.reportValidity();
      setStatus(shareStatus, error, true);
      return;
    }

    currentInvite = invite;
    currentShareUrl = buildShareUrl(invite);
    generatedLink.value = currentShareUrl;
    generatedLinkWrap.hidden = false;
    setShareButtonsEnabled(true);
    setStatus(shareStatus, "邀請卡連結已生成，可以複製、預覽、Email 或分享到 LINE。");
  });

  copyLinkButton.addEventListener("click", () => {
    generatedLink.select();
    copyText(currentShareUrl, shareStatus, "邀請卡連結已複製。");
  });

  openGuestButton.addEventListener("click", () => {
    if (currentShareUrl) window.open(currentShareUrl, "_blank", "noopener,noreferrer");
  });

  emailButton.addEventListener("click", () => {
    if (!currentInvite || !currentShareUrl) return;
    openMailTo("", `邀請你參加：${currentInvite.eventTitle}`, composeInviteEmail(currentInvite));
  });

  lineButton.addEventListener("click", () => {
    if (!currentInvite || !currentShareUrl) return;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      currentShareUrl,
    )}&text=${encodeURIComponent(composeLineText(currentInvite))}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer");
  });
}

function renderGuestInvite(invite) {
  publicInvite = normalizeInvite(invite);
  creatorView.hidden = true;
  guestView.hidden = false;
  selectedResponse = null;

  renderCard(
    publicInvite,
    {
      card: "#publicCard",
      title: "#publicTitle",
      guest: "#publicGuest",
      date: "#publicDate",
      place: "#publicPlace",
      times: "#publicTimes",
      message: "#publicMessage",
      host: "#publicHost",
    },
    { interactive: true },
  );

  document.querySelector("#responderName").value = publicInvite.guestName || "";
  publicDeclineButton.dataset.responseValue = "已有安排，相約他日";
  publicDeclineButton.setAttribute("aria-pressed", "false");
  publicDeclineButton.addEventListener("click", () => {
    selectResponse({
      value: "已有安排，相約他日",
      label: "已有安排，相約他日",
      attending: false,
    });
  });
}

function selectResponse(option) {
  selectedResponse = option;
  document.querySelectorAll("[data-response-value]").forEach((item) => {
    const isSelected = item.dataset.responseValue === option.value;
    item.classList.toggle("selected", isSelected);
    item.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  responseSummary.textContent = `已選擇：${option.label}`;
  responseSummary.classList.add("selected");
  sendResponseButton.disabled = false;
  copyResponseButton.disabled = false;
  setStatus(responseStatus, "回覆已選好，可以寄出 Email 或複製內容。");
}

function composeResponseText() {
  const name = cleanText(document.querySelector("#responderName").value);
  const note = cleanText(document.querySelector("#responderNote").value);
  const responder = name || publicInvite.guestName || "受邀者";

  return [
    `${publicInvite.hostName || "你好"}，`,
    "",
    `我是 ${responder}。`,
    `我對「${publicInvite.eventTitle}」的回覆：${selectedResponse.label}`,
    `日期：${formatDate(publicInvite.eventDate)}`,
    publicInvite.eventPlace ? `地點或活動方式：${publicInvite.eventPlace}` : "",
    note ? `補充留言：${note}` : "",
    "",
    "這封信是由線上邀請卡協助產生。",
  ]
    .filter(Boolean)
    .join("\n");
}

function initGuestActions() {
  sendResponseButton.addEventListener("click", () => {
    if (!selectedResponse) {
      setStatus(responseStatus, "請先選擇一個可參加時間，或選擇無法參加。", true);
      return;
    }

    openMailTo(
      publicInvite.hostEmail,
      `回覆邀請：${publicInvite.eventTitle}`,
      composeResponseText(),
    );
    setStatus(responseStatus, "已開啟 Email。請在郵件視窗中確認並送出。");
  });

  copyResponseButton.addEventListener("click", () => {
    if (!selectedResponse) return;
    copyText(composeResponseText(), responseStatus, "回覆內容已複製。");
  });
}

function boot() {
  initGuestActions();
  const params = new URLSearchParams(window.location.search);
  const encodedInvite = params.get("card");

  if (encodedInvite) {
    try {
      renderGuestInvite(decodeInvite(encodedInvite));
      return;
    } catch {
      creatorView.hidden = false;
      guestView.hidden = true;
      initCreator();
      setStatus(shareStatus, "這個邀請卡連結無法讀取，請重新生成。", true);
      return;
    }
  }

  initCreator();
}

boot();
