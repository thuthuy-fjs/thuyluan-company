"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { baseCertificates } from "../data";
import "../editor-fields";
import "../services-data";
import { getEditableFields } from "../editor-content";
import { sliderSlotLabel } from "../slider-slots";
import bundledMedia from "../media-catalog.json";
import { imageCategories, normalizedCategory } from "../media-groups";
import VisualEditor from "./visual-editor";
import CertificateManager from "./certificate-manager";

const fields = getEditableFields();
const bundledMediaIds = new Set(bundledMedia.map((item) => item.id));
const availableState = (next) => {
  if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) return next;
  const available = (items) => (items || []).filter((item) => bundledMediaIds.has(item.id) || item.id.startsWith("upload-"));
  return { ...next, media: available(next.media).map((item) => ({ ...item, category: normalizedCategory(item) })), publishedMedia: available(next.publishedMedia).map((item) => ({ ...item, category: normalizedCategory(item) })) };
};
const defaultButtons = { "home.hero.consult": { label: "Yêu cầu tư vấn" }, "home.hero.services": { label: "Khám phá dịch vụ" } };
const withButtons = (saved = {}) => Object.fromEntries(Object.entries(defaultButtons).map(([id, value]) => [id, { label: saved[id]?.label || value.label }]));
const imageTarget = (mapping, id) => {
  const seen = new Set();
  let current = id;
  while (mapping[current] && !seen.has(current)) { seen.add(current); current = mapping[current].slice(8); }
  return current;
};
const mediaSrc = (item) => item.preview || (item.id.startsWith("upload-") ? `/api/admin/asset/${item.id}` : item.src);
const readJson = async (response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : {};
  if (response.status === 404 && !isJson) {
    const local = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    throw new Error(local
      ? "API quản trị không chạy với npm run dev. Hãy mở http://localhost:4173/admin/."
      : "API quản trị chưa hoạt động trên máy chủ này.");
  }
  if (!response.ok) throw new Error(data.error || "Yêu cầu không thành công.");
  return data;
};
const api = (path, options) => fetch(`/api/admin/${path}`, { credentials: "same-origin", cache: "no-store", ...options }).then(readJson);
const asBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(",")[1]);
  reader.onerror = () => reject(new Error("Không đọc được ảnh."));
  reader.readAsDataURL(file);
});

export default function AdminPage() {
  const uploadButtonRef = useRef(null);
  const uploadFileRef = useRef(null);
  const uploadPickerRef = useRef(null);
  const [phase, setPhase] = useState("loading");
  const [pin, setPin] = useState("");
  const [state, setState] = useState(null);
  const [textDraft, setTextDraft] = useState({});
  const [buttonsDraft, setButtonsDraft] = useState(withButtons());
  const [sliderDraft, setSliderDraft] = useState({});
  const [certificateDraft, setCertificateDraft] = useState(baseCertificates);
  const [mediaDraft, setMediaDraft] = useState({});
  const [replacements, setReplacements] = useState({});
  const [autoReplacements, setAutoReplacements] = useState([]);
  const [deletes, setDeletes] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [tab, setTab] = useState("text");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Suất ăn");
  const [uploadCategory, setUploadCategory] = useState("Khác");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [replaceImageId, setReplaceImageId] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    let signedIn = false;
    try {
      const session = await api("session");
      if (!session.authenticated) { setPhase("login"); return; }
      signedIn = true;
      const next = await api("state");
      setState(availableState(next));
      setTextDraft(next.content.text || {});
      setButtonsDraft(withButtons(next.content.buttons));
      setSliderDraft(next.content.sliderImages || {});
      setCertificateDraft(next.content.certificates || baseCertificates);
      setPhase("ready");
    } catch (error) { setMessage(error.message); setPhase(signedIn ? "error" : "login"); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!uploadOpen) return;
    uploadPickerRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === "Escape" && !uploading) closeUploadDialog(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [uploadOpen, uploading]);

  const closeUploadDialog = () => {
    setUploadOpen(false);
    setReplaceImageId("");
    setPendingFiles([]);
    setUploadError("");
    uploadButtonRef.current?.focus();
  };

  const login = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      await api("login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) });
      setPin(""); await load();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    await api("logout", { method: "POST" }).catch(() => {});
    setState(null); setPhase("login"); setPin("");
  };

  const addFiles = async (fileList, replaceId = "", sliderSlot = "", category = uploadCategory, deleteOriginal = false, fromContent = false) => {
    setMessage("");
    const next = [];
    try {
      const effectiveReplaceId = category === "Logo" && !replaceId ? state?.media.find((item) => item.category === "Logo")?.id || "" : replaceId;
      const replaced = state?.media.find((item) => item.id === effectiveReplaceId);
      const isLogo = replaced?.category === "Logo" || category === "Logo";
      const removeOriginal = deleteOriginal || isLogo;
      const targetCategory = isLogo ? "Logo" : fromContent ? "Khác" : replaced?.category || category;
      const previousUploadId = removeOriginal && uploads.some((item) => item.id === replacements[effectiveReplaceId]) ? replacements[effectiveReplaceId] : "";
      if (removeOriginal && (!replaced || fileList.length !== 1)) throw new Error("Hãy chọn một ảnh để thay tệp cũ.");
      if (uploads.length - Number(Boolean(previousUploadId)) + fileList.length > 4) throw new Error("Mỗi lần xuất bản tối đa 4 ảnh mới.");
      for (const file of [...fileList]) {
        if (!/^image\/(?:png|jpeg|webp)$/.test(file.type) || file.size > 4_000_000) throw new Error("Chỉ nhận PNG, JPG hoặc WebP tối đa 4 MB mỗi ảnh.");
        const bitmap = await createImageBitmap(file);
        const width = bitmap.width, height = bitmap.height;
        bitmap.close();
        if (removeOriginal && !isLogo && targetCategory !== "Chứng chỉ – Chứng nhận") {
          const ratio = (width / height) / (replaced.width / replaced.height);
          if (ratio < 0.7 || ratio > 1.4) throw new Error("Ảnh thay thế cần có tỷ lệ gần với ảnh cũ. Hãy chọn ảnh khác.");
        }
        const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        next.push({ id: `upload-${crypto.randomUUID()}.${ext}`, file, preview: URL.createObjectURL(file), width, height, category: targetCategory, title: file.name.replace(/\.[^.]+$/, "") });
      }
      setUploads((items) => [...items.filter((item) => {
        if (item.id === previousUploadId) URL.revokeObjectURL(item.preview);
        return item.id !== previousUploadId;
      }), ...next]);
      if (sliderSlot && next[0]) setSliderDraft((items) => ({ ...items, [sliderSlot]: `/assets/${next[0].id}` }));
      else if (effectiveReplaceId && next[0]) {
        setReplacements((items) => ({ ...items, [effectiveReplaceId]: next[0].id }));
        if (removeOriginal) {
          setDeletes((items) => items.includes(effectiveReplaceId) ? items : [...items, effectiveReplaceId]);
          setAutoReplacements((items) => items.filter((id) => id !== effectiveReplaceId));
          setFilterCategory(targetCategory);
          setSearch("");
        }
      }
      else { setFilterCategory(targetCategory); setSearch(""); setTab("media"); }
      return next;
    } catch (error) { next.forEach((item) => URL.revokeObjectURL(item.preview)); setMessage(error.message); setUploadError(error.message); return false; }
  };
  const removeUpload = (id) => {
    const replacedOldIds = Object.keys(replacements).filter((oldId) => replacements[oldId] === id);
    setUploads((items) => items.filter((item) => {
      if (item.id === id) URL.revokeObjectURL(item.preview);
      return item.id !== id;
    }));
    setReplacements((old) => Object.fromEntries(Object.entries(old).filter(([, target]) => target !== id)));
    setDeletes((items) => items.filter((oldId) => !replacedOldIds.includes(oldId)));
    setSliderDraft((old) => {
      const next = { ...old };
      for (const [slot, target] of Object.entries(next)) if (target === `/assets/${id}`) {
        if (state?.content.sliderImages?.[slot]) next[slot] = state.content.sliderImages[slot];
        else delete next[slot];
      }
      return next;
    });
  };
  const updateUpload = (id, patch) => {
    setUploads((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
    if (patch.category) setFilterCategory(patch.category);
  };
  const addCertificate = async ({ title, category, files }) => {
    if (!title || !category || !files.length) { setMessage("Điền tên, loại chứng nhận và chọn ít nhất một trang."); return false; }
    const added = await addFiles(files, "", "", "Chứng chỉ – Chứng nhận");
    if (!added) return false;
    setCertificateDraft((items) => [...items, {
      id: `certificate-${crypto.randomUUID()}`, title, category,
      pages: added.map((item, index) => ({ title: files[index].name.replace(/\.[^.]+$/, "").slice(0, 120) || `Trang ${index + 1}`, image: `/assets/${item.id}` })),
    }]);
    return true;
  };
  const addCertificatePages = async (certificateId, files) => {
    const certificate = certificateDraft.find((item) => item.id === certificateId);
    if (!certificate || certificate.pages.length + files.length > 12) { setMessage("Mỗi chứng nhận có tối đa 12 trang."); return; }
    const added = await addFiles(files, "", "", "Chứng chỉ – Chứng nhận");
    if (!added) return;
    setCertificateDraft((items) => items.map((item) => item.id === certificateId ? { ...item, pages: [...item.pages, ...added.map((image, index) => ({ title: files[index].name.replace(/\.[^.]+$/, "").slice(0, 120) || `Trang ${item.pages.length + index + 1}`, image: `/assets/${image.id}` }))] } : item));
  };
  const replaceCertificatePage = async (certificateId, pageIndex, file) => {
    const certificate = certificateDraft.find((item) => item.id === certificateId);
    const oldId = certificate?.pages[pageIndex]?.image.slice(8);
    if (!oldId) return;
    let nextId;
    const pending = uploads.find((item) => item.id === oldId);
    if (pending) {
      try {
        if (!/^image\/(?:png|jpeg|webp)$/.test(file.type) || file.size > 4_000_000) throw new Error("Chỉ nhận PNG, JPG hoặc WebP tối đa 4 MB mỗi ảnh.");
        const bitmap = await createImageBitmap(file);
        const width = bitmap.width, height = bitmap.height;
        bitmap.close();
        const preview = URL.createObjectURL(file);
        setUploads((items) => items.map((item) => item.id === oldId ? { ...item, file, preview, width, height, title: file.name.replace(/\.[^.]+$/, "") } : item));
        URL.revokeObjectURL(pending.preview);
        nextId = oldId;
      } catch (error) { setMessage(error.message); return; }
    } else {
      const added = await addFiles([file], oldId, "", "Chứng chỉ – Chứng nhận", true);
      if (!added) return;
      nextId = added[0].id;
    }
    setCertificateDraft((items) => items.map((item) => item.id === certificateId ? { ...item, pages: item.pages.map((page, index) => index === pageIndex ? { ...page, image: `/assets/${nextId}` } : page) } : item));
  };
  const removeNewCertificate = (certificateId) => {
    const certificate = certificateDraft.find((item) => item.id === certificateId);
    if (!certificate || baseCertificates.some((item) => item.id === certificateId) || state?.content.certificates?.some((item) => item.id === certificateId)) return;
    for (const page of certificate.pages) if (uploads.some((item) => item.id === page.image.slice(8))) removeUpload(page.image.slice(8));
    setCertificateDraft((items) => items.filter((item) => item.id !== certificateId));
  };
  const updateText = (id, value) => setTextDraft((old) => {
    const next = { ...old };
    if (value !== undefined) next[id] = value;
    else if (state?.content.text?.[id] !== undefined) next[id] = state.content.text[id];
    else delete next[id];
    return next;
  });
  const media = useMemo(() => [...uploads, ...(state?.media || [])], [state, uploads]);
  const previewReplacements = useMemo(() => {
    const published = state?.publishedContent?.images || {};
    const draft = state?.content?.images || {};
    const next = {};
    for (const id of new Set([...Object.keys(published), ...Object.keys(draft)])) {
      const from = imageTarget(published, id);
      const to = imageTarget(draft, id);
      if (from !== to) next[from] = to;
    }
    return { ...next, ...replacements };
  }, [state, replacements]);
  const toggleDelete = (id) => {
    if (deletes.includes(id)) {
      setDeletes((items) => items.filter((item) => item !== id));
      if (autoReplacements.includes(id)) {
        setReplacements((old) => { const next = { ...old }; delete next[id]; return next; });
        setAutoReplacements((items) => items.filter((item) => item !== id));
      }
      return;
    }
    if (Object.values(replacements).includes(id)) { setMessage("Ảnh này đang được chọn làm ảnh thay thế. Hãy đổi lựa chọn đó trước khi xóa."); return; }
    const old = media.find((item) => item.id === id);
    if (!replacements[id]) {
      const category = mediaDraft[id]?.category ?? old.category;
      if (old.protected || category === "Logo" || category === "Chứng chỉ – Chứng nhận") { setMessage("Logo và ảnh chứng nhận cần chọn ảnh thay thế thủ công trước khi xóa."); return; }
      const candidates = media.filter((item) => item.id !== id && !item.protected && !deletes.includes(item.id) && (mediaDraft[item.id]?.category ?? item.category) === category && (item.width / item.height) / (old.width / old.height) >= 0.7 && (item.width / item.height) / (old.width / old.height) <= 1.4);
      if (!candidates.length) { setMessage("Không có ảnh cùng loại và tỷ lệ phù hợp. Hãy chọn ảnh thay thế thủ công."); return; }
      const index = crypto.getRandomValues(new Uint32Array(1))[0] % candidates.length;
      setReplacements((items) => ({ ...items, [id]: candidates[index].id }));
      setAutoReplacements((items) => [...items, id]);
    }
    setDeletes((items) => [...items, id]);
    setMessage("");
  };
  const mediaMatches = media.filter((item) => item.category !== "Chứng chỉ – Chứng nhận" && !(item.category === "Logo" && deletes.includes(item.id) && replacements[item.id]) && (filterCategory === "Tất cả" || (mediaDraft[item.id]?.category ?? item.category) === filterCategory) && `${item.id} ${item.title || ""} ${item.category}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const changedText = fields.filter((field) => (textDraft[field.id] ?? field.defaultValue) !== (state?.content.text?.[field.id] ?? field.defaultValue));
  const changedButtons = Object.keys(defaultButtons).filter((id) => JSON.stringify(buttonsDraft[id]) !== JSON.stringify(withButtons(state?.content.buttons)[id]));
  const changedSlides = [...new Set([...Object.keys(sliderDraft), ...Object.keys(state?.content.sliderImages || {})])].filter((slot) => sliderDraft[slot] !== state?.content.sliderImages?.[slot]);
  const previewText = fields.filter((field) => (textDraft[field.id] ?? field.defaultValue) !== (state?.publishedContent?.text?.[field.id] ?? field.defaultValue));
  const previewButtons = Object.keys(defaultButtons).filter((id) => JSON.stringify(buttonsDraft[id]) !== JSON.stringify(withButtons(state?.publishedContent?.buttons)[id]));
  const previewSlides = [...new Set([...Object.keys(sliderDraft), ...Object.keys(state?.publishedContent?.sliderImages || {})])].filter((slot) => sliderDraft[slot] !== state?.publishedContent?.sliderImages?.[slot]);
  const publishedIds = new Set((state?.publishedMedia || []).map((item) => item.id));
  const savedNewImages = (state?.media || []).filter((item) => !publishedIds.has(item.id));
  const savedDeletedIds = new Set((state?.publishedMedia || []).filter((item) => !(state?.media || []).some((draft) => draft.id === item.id)).map((item) => item.id));
  const previewImageIds = [...new Set([...savedDeletedIds, ...deletes, ...Object.keys(previewReplacements)])];
  const changedCertificates = JSON.stringify(certificateDraft) !== JSON.stringify(state?.content.certificates || baseCertificates);
  const changes = changedText.length + changedButtons.length + changedSlides.length + Number(changedCertificates) + uploads.length + deletes.length + Object.keys(replacements).length + Object.keys(mediaDraft).length;

  const writeDraft = async () => {
    const fileData = await Promise.all(uploads.map(async (item) => ({
      id: item.id, base64: await asBase64(item.file), width: item.width, height: item.height,
      category: item.category, title: item.title,
    })));
    const result = await api("draft", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseHead: state.head, basePublishedHead: state.publishedHead, text: textDraft, buttons: buttonsDraft, sliderImages: sliderDraft, certificates: certificateDraft, mediaUpdates: mediaDraft, replacements, deletes, uploads: fileData }),
    });
    uploads.forEach((item) => URL.revokeObjectURL(item.preview));
    setUploads([]); setDeletes([]); setReplacements({}); setAutoReplacements([]); setMediaDraft({});
    const next = await api("state");
    setState(availableState(next)); setTextDraft(next.content.text || {}); setButtonsDraft(withButtons(next.content.buttons)); setSliderDraft(next.content.sliderImages || {}); setCertificateDraft(next.content.certificates || baseCertificates);
    return { result, next };
  };
  const saveDraft = async () => {
    setBusy(true); setMessage("");
    try {
      const { result } = await writeDraft();
      setMessage(`Đã lưu bản nháp ${result.draftCommit.slice(0, 8)}. Website công khai chưa thay đổi.`);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  const publishDraft = async () => {
    setBusy(true); setMessage("");
    try {
      // Unsaved edits are saved to the draft branch first, then published together.
      const heads = changes ? (await writeDraft()).next : state;
      const result = await api("publish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftHead: heads.draftHead, publishedHead: heads.publishedHead }),
      });
      const next = await api("state");
      setState(availableState(next)); setTextDraft(next.content.text || {}); setButtonsDraft(withButtons(next.content.buttons)); setSliderDraft(next.content.sliderImages || {}); setCertificateDraft(next.content.certificates || baseCertificates);
      setMessage(`Đã xuất bản ${result.commit.slice(0, 8)}. Website sẽ cập nhật sau khi build và triển khai xong.${result.draftReset ? "" : " Cần đồng bộ lại nhánh nháp."}`);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  if (phase === "loading") return <main className="admin-shell admin-center">Đang kiểm tra quyền truy cập…</main>;
  if (phase === "error") return <main className="admin-shell admin-center"><div className="admin-login"><span className="admin-kicker">THÚY LUÂN · QUẢN TRỊ</span><h1>Chưa tải được dữ liệu</h1><p className="admin-error" role="alert">{message}</p><button type="button" onClick={load}>Thử lại</button><button type="button" onClick={logout}>Đăng xuất</button></div></main>;
  if (phase === "login") return (
    <main className="admin-shell admin-center">
      <form className="admin-login" onSubmit={login}>
        <a href="/">← Về website</a>
        <span className="admin-kicker">THÚY LUÂN · QUẢN TRỊ</span>
        <h1>Nhập mã PIN</h1>
        <p>Đăng nhập để chỉnh sửa nội dung và hình ảnh website.</p>
        <label htmlFor="admin-pin">Mã PIN quản trị</label>
        <input id="admin-pin" type="password" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={pin} onChange={(event) => setPin(event.target.value)} required />
        {message && <p className="admin-error" role="alert">{message}</p>}
        <button type="submit" disabled={busy}>{busy ? "Đang kiểm tra…" : "Đăng nhập"}</button>
      </form>
    </main>
  );
  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><span className="admin-kicker">THÚY LUÂN · QUẢN TRỊ</span><h1>Chỉnh sửa website</h1></div>
        <div className="admin-top-actions"><a href="/" target="_blank" rel="noopener noreferrer">Xem website ↗</a><button type="button" onClick={logout}>Đăng xuất</button></div>
      </header>
      <div className="admin-toolbar">
        <nav aria-label="Mục quản trị">
          <button className={tab === "text" ? "active" : ""} onClick={() => setTab("text")}>Nội dung</button>
          <button className={tab === "media" ? "active" : ""} onClick={() => setTab("media")}>Hình ảnh</button>
          <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>Xem trước{changes ? ` (${changes})` : state.hasUnpublishedDraft ? " (nháp)" : ""}</button>
        </nav>
        {tab === "media" && <input type="search" placeholder="Tìm nội dung hoặc ảnh…" value={search} onChange={(event) => setSearch(event.target.value)} />}
      </div>
      {message && <div className={message.startsWith("Đã lưu") || message.startsWith("Đã xuất bản") ? "admin-notice" : "admin-error"} role="status">{message}</div>}
      {tab === "text" && <VisualEditor fields={fields} savedText={state.content.text || {}} publishedText={state.publishedContent?.text || {}} draftText={textDraft} onChange={updateText} buttons={buttonsDraft} onButtonChange={(id, patch) => setButtonsDraft((old) => ({ ...old, [id]: { ...old[id], ...patch } }))} onImageUpload={(id, files) => addFiles(files, id, "", "Khác", false, true)} onSliderUpload={(slot, id, files) => addFiles(files, id, slot, "Khác", false, true)} onSliderChange={(slot, id) => setSliderDraft((old) => { const next = { ...old }; if (id) next[slot] = `/assets/${id}`; else delete next[slot]; return next; })} sliderImages={sliderDraft} replacements={previewReplacements} media={media} deletedIds={deletes} />}
      {tab === "media" && <div className="admin-media-panel">
        <div className="admin-media-toolbar">
          {filterCategory !== "Chứng chỉ – Chứng nhận" && <button ref={uploadButtonRef} className="admin-upload" type="button" onClick={() => { setReplaceImageId(""); setUploadCategory("Suất ăn"); setPendingFiles([]); setUploadError(""); setMessage(""); setUploadOpen(true); }}>+ Thêm ảnh</button>}
          <label>Lọc nhóm ảnh<select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}><option>Tất cả</option>{imageCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
        </div>
        <p className="admin-help">Ảnh trong bốn nhóm thư viện sẽ xuất hiện ở trang Hình ảnh thực tế sau khi xuất bản. Logo luôn có một ảnh; tải logo mới sẽ thay và xóa tệp cũ.</p>
        {(filterCategory === "Chứng chỉ – Chứng nhận" || filterCategory === "Tất cả") && <CertificateManager certificates={certificateDraft} media={media} search={search} onChange={setCertificateDraft} onAdd={addCertificate} onReplacePage={replaceCertificatePage} onAddPages={addCertificatePages} onRemove={removeNewCertificate} canRemove={(id) => !baseCertificates.some((item) => item.id === id) && !state?.content.certificates?.some((item) => item.id === id)} />}
        <div className="admin-media-grid">{mediaMatches.map((item) => {
          const uploaded = uploads.some((entry) => entry.id === item.id);
          const draft = mediaDraft[item.id] || {};
          return <article className={`admin-media-card${deletes.includes(item.id) ? " is-deleted" : ""}`} key={item.id}>
            <img src={mediaSrc(item)} alt={item.title || item.id} loading="lazy" />
            <div className="admin-media-fields">
              <small>{item.width} × {item.height}</small>
              <label>Tên ảnh<input value={uploaded ? item.title : draft.title ?? item.title ?? item.id} onChange={(event) => uploaded ? updateUpload(item.id, { title: event.target.value }) : setMediaDraft((old) => ({ ...old, [item.id]: { ...old[item.id], title: event.target.value } }))} /></label>
              <label>Nhóm ảnh<select value={uploaded ? item.category : draft.category ?? item.category} disabled={item.category === "Logo"} onChange={(event) => { if (uploaded) updateUpload(item.id, { category: event.target.value }); else { setMediaDraft((old) => ({ ...old, [item.id]: { ...old[item.id], category: event.target.value } })); setFilterCategory(event.target.value); } }}>
                {imageCategories.filter((value) => value !== "Chứng chỉ – Chứng nhận" && (value !== "Logo" || item.category === "Logo")).map((value) => <option key={value}>{value}</option>)}
              </select></label>
              {uploaded ? <button type="button" onClick={() => removeUpload(item.id)}>Bỏ ảnh mới</button> : <>
                {replacements[item.id]?.startsWith("upload-") && deletes.includes(item.id) && <p className="admin-replacement-note">Đang thay bằng ảnh mới trong bản nháp.</p>}
                <button type="button" onClick={() => { setReplaceImageId(item.id); setUploadCategory(draft.category || item.category); setPendingFiles([]); setUploadError(""); setMessage(""); setUploadOpen(true); }}>Thay tệp ảnh</button>
                {replacements[item.id]?.startsWith("upload-") && deletes.includes(item.id) ? <button type="button" onClick={() => removeUpload(replacements[item.id])}>Hoàn tác thay ảnh</button> : item.category !== "Logo" && <label className="admin-check"><input type="checkbox" checked={deletes.includes(item.id)} onChange={() => toggleDelete(item.id)} /> Xóa ảnh này trong bản nháp</label>}
              </>}
            </div>
          </article>;
        })}</div>
        {!mediaMatches.length && filterCategory !== "Chứng chỉ – Chứng nhận" && <p>Không tìm thấy ảnh.</p>}
      </div>}
      {uploadOpen && <div className="admin-upload-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) closeUploadDialog(); }}>
        <section className="admin-upload-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-upload-title">
          <button className="admin-upload-close" type="button" onClick={closeUploadDialog} disabled={uploading} aria-label="Đóng popup ảnh">×</button>
          <h2 id="admin-upload-title">{replaceImageId ? "Thay tệp ảnh" : "Thêm ảnh"}</h2>
          {replaceImageId ? <p>{uploadCategory === "Logo" ? "Logo mới sẽ thay logo hiện tại; tệp cũ được xóa khi xuất bản." : "Chọn ảnh có tỷ lệ gần với ảnh cũ. Mọi vị trí dùng ảnh này sẽ chuyển sang tệp mới khi lưu nháp; tệp cũ được xóa khi xuất bản."}</p> : <p>{uploadCategory === "Logo" ? "Chọn một ảnh để thay logo hiện tại." : `Chọn tối đa ${Math.max(0, 4 - uploads.length)} ảnh PNG, JPG hoặc WebP, mỗi ảnh tối đa 4 MB.`}</p>}
          {replaceImageId && <div className="admin-upload-current"><img src={mediaSrc(media.find((item) => item.id === replaceImageId))} alt="Ảnh hiện tại" /><span>Ảnh hiện tại<br /><strong>{mediaDraft[replaceImageId]?.title || media.find((item) => item.id === replaceImageId)?.title || replaceImageId}</strong></span></div>}
          <button ref={uploadPickerRef} className="admin-upload-picker" type="button" onClick={() => uploadFileRef.current?.click()}>Chọn ảnh để tải lên</button>
          <input ref={uploadFileRef} className="admin-upload-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple={!replaceImageId && uploadCategory !== "Logo"} onChange={(event) => { setPendingFiles([...event.target.files]); setUploadError(""); }} />
          {pendingFiles.length > 0 && <div className="admin-upload-files"><strong>Đã chọn {pendingFiles.length} ảnh</strong><ul>{pendingFiles.map((file, index) => <li key={`${file.name}-${index}`}>{file.name}</li>)}</ul></div>}
          {!replaceImageId && <label className="admin-upload-category">Nhóm ảnh<select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)}>{imageCategories.filter((category) => category !== "Chứng chỉ – Chứng nhận").map((category) => <option key={category}>{category}</option>)}</select></label>}
          {uploadError && <p className="admin-error" role="alert">{uploadError}</p>}
          <div className="admin-upload-actions"><button type="button" onClick={closeUploadDialog} disabled={uploading}>Hủy</button><button type="button" disabled={!pendingFiles.length || uploading} onClick={async () => { setUploading(true); const added = await addFiles(pendingFiles, replaceImageId, "", uploadCategory, Boolean(replaceImageId)); setUploading(false); if (added) closeUploadDialog(); }}>{uploading ? "Đang tải…" : replaceImageId || uploadCategory === "Logo" ? "Thay trong bản nháp" : "Thêm vào bản nháp"}</button></div>
        </section>
      </div>}
      {tab === "preview" && <div className="admin-preview">
        <h2>Bản xem trước</h2>
        <p>Thay đổi đang sửa chỉ nằm trên trình duyệt. Bấm Lưu nháp để giữ lại, hoặc Xuất bản để lưu và đưa lên website ngay.</p>
        <VisualEditor fields={fields} savedText={state.content.text || {}} publishedText={state.publishedContent?.text || {}} draftText={textDraft} onChange={updateText} buttons={buttonsDraft} sliderImages={sliderDraft} replacements={previewReplacements} media={media} readOnly />
        <h3>Nút ({previewButtons.length})</h3>
        {previewButtons.map((id) => <div className="admin-preview-row" key={id}><small>Nút {id === "home.hero.consult" ? "Yêu cầu tư vấn" : "Khám phá dịch vụ"}</small><p>{buttonsDraft[id].label}</p></div>)}
        <h3>Văn bản ({previewText.length})</h3>
        {previewText.map((field) => <div className="admin-preview-row" key={field.id}><small>{field.section}</small><p>{textDraft[field.id] ?? field.defaultValue}</p></div>)}
        <h3>Ảnh trong slider ({previewSlides.length})</h3>
        {previewSlides.map((slot) => { const item = media.find((entry) => entry.id === sliderDraft[slot]?.slice(8)); return <div className="admin-preview-row" key={slot}><small>{sliderSlotLabel(slot)}</small><p>{item?.title || "Ảnh gốc"}</p>{item && <div className="admin-preview-images"><img src={mediaSrc(item)} alt={item.title || "Ảnh trong slider"} /></div>}</div>; })}
        <h3>Chứng chỉ – Chứng nhận {changedCertificates ? "(đã chỉnh sửa)" : "(không đổi)"}</h3>
        {changedCertificates && certificateDraft.map((certificate) => <div className="admin-preview-row" key={certificate.id}><small>{certificate.category}</small><p>{certificate.title} · {certificate.pages.length} trang</p></div>)}
        <h3>Ảnh mới ({savedNewImages.length + uploads.length})</h3>
        <div className="admin-preview-images">{[...savedNewImages, ...uploads].map((item) => <figure key={item.id}><img src={mediaSrc(item)} alt={item.title} /><figcaption>{item.title}</figcaption></figure>)}</div>
        <h3>Thay hoặc xóa ảnh ({previewImageIds.length})</h3>
        {previewImageIds.map((id) => {
          const old = (state.publishedMedia || []).find((item) => item.id === id) || media.find((item) => item.id === id);
          const next = media.find((item) => item.id === previewReplacements[id]);
          const deleted = savedDeletedIds.has(id) || deletes.includes(id);
          return <div className="admin-preview-row" key={id}><small>{old?.title || "Ảnh"}</small><p>{deleted ? "Xóa" : "Thay"} → {next?.title || "Chưa chọn ảnh thay thế"}</p><div className="admin-preview-images">{old && <img src={mediaSrc(old)} alt="Ảnh cũ" />}{next && <img src={mediaSrc(next)} alt="Ảnh thay thế" />}</div></div>;
        })}
        <h3>Thông tin ảnh ({Object.keys(mediaDraft).length})</h3>
        {Object.entries(mediaDraft).map(([id, values]) => <div className="admin-preview-row" key={id}><small>Thông tin ảnh</small><p>{values.title || media.find((item) => item.id === id)?.title || "Ảnh"} · {values.category || media.find((item) => item.id === id)?.category}</p></div>)}
      </div>}
      <footer className="admin-publish-bar">
        <span>{changes ? `${changes} thay đổi chưa lưu` : state.hasUnpublishedDraft ? "Đã lưu nháp · Chưa xuất bản" : "Draft và Published đã đồng bộ"}</span>
        <div className="admin-publish-actions">
          <button type="button" onClick={saveDraft} disabled={busy || !changes}>{busy ? "Đang xử lý…" : "Lưu nháp"}</button>
          <button type="button" onClick={publishDraft} disabled={busy || (!changes && !state.hasUnpublishedDraft)}>{busy ? "Đang xử lý…" : "Xuất bản"}</button>
        </div>
      </footer>
    </main>
  );
}
