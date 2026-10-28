"use client";

import { useEffect, useMemo, useState } from "react";
import "../data";
import "../editor-fields";
import "../services-data";
import { getEditableFields } from "../editor-content";

const fields = getEditableFields();
const galleryCategories = ["Không gian bếp", "Giao nhận", "Phục vụ", "Hoạt động tập thể"];
const readJson = async (response) => {
  const data = await response.json().catch(() => ({}));
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
  const [phase, setPhase] = useState("loading");
  const [pin, setPin] = useState("");
  const [state, setState] = useState(null);
  const [textDraft, setTextDraft] = useState({});
  const [mediaDraft, setMediaDraft] = useState({});
  const [replacements, setReplacements] = useState({});
  const [autoReplacements, setAutoReplacements] = useState([]);
  const [deletes, setDeletes] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [tab, setTab] = useState("text");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    let signedIn = false;
    try {
      const session = await api("session");
      if (!session.authenticated) { setPhase("login"); return; }
      signedIn = true;
      const next = await api("state");
      setState(next);
      setTextDraft(next.content.text || {});
      setPhase("ready");
    } catch (error) { setMessage(error.message); setPhase(signedIn ? "error" : "login"); }
  };
  useEffect(() => { load(); }, []);

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

  const addFiles = async (fileList) => {
    setMessage("");
    try {
      const next = [];
      for (const file of [...fileList]) {
        if (!/^image\/(?:png|jpeg|webp)$/.test(file.type) || file.size > 4_000_000) throw new Error("Chỉ nhận PNG, JPG hoặc WebP tối đa 4 MB mỗi ảnh.");
        const bitmap = await createImageBitmap(file);
        const width = bitmap.width, height = bitmap.height;
        bitmap.close();
        const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        next.push({ id: `upload-${crypto.randomUUID()}.${ext}`, file, preview: URL.createObjectURL(file), width, height, category: "Khác", title: file.name.replace(/\.[^.]+$/, ""), addToGallery: false, galleryCategory: "Phục vụ" });
      }
      if (uploads.length + next.length > 4) throw new Error("Mỗi lần xuất bản tối đa 4 ảnh mới.");
      setUploads((items) => [...items, ...next]);
      setTab("media");
    } catch (error) { setMessage(error.message); }
  };
  const removeUpload = (id) => {
    setUploads((items) => items.filter((item) => {
      if (item.id === id) URL.revokeObjectURL(item.preview);
      return item.id !== id;
    }));
    setReplacements((old) => Object.fromEntries(Object.entries(old).filter(([, target]) => target !== id)));
  };
  const updateUpload = (id, patch) => setUploads((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const media = useMemo(() => [...(state?.media || []), ...uploads], [state, uploads]);
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
      if (old.protected) { setMessage("Ảnh tài liệu hoặc nhận diện cần chọn ảnh thay thế thủ công trước khi xóa."); return; }
      const candidates = media.filter((item) => item.id !== id && !item.protected && !deletes.includes(item.id) && item.category === old.category && (item.width / item.height) / (old.width / old.height) >= 0.7 && (item.width / item.height) / (old.width / old.height) <= 1.4);
      if (!candidates.length) { setMessage("Không có ảnh cùng loại và tỷ lệ phù hợp. Hãy chọn ảnh thay thế thủ công."); return; }
      const index = crypto.getRandomValues(new Uint32Array(1))[0] % candidates.length;
      setReplacements((items) => ({ ...items, [id]: candidates[index].id }));
      setAutoReplacements((items) => [...items, id]);
    }
    setDeletes((items) => [...items, id]);
    setMessage("");
  };
  const fieldMatches = fields.filter((field) => `${field.id} ${field.defaultValue} ${textDraft[field.id] || ""}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const mediaMatches = media.filter((item) => `${item.id} ${item.title || ""} ${item.category}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const changedText = fields.filter((field) => (textDraft[field.id] ?? field.defaultValue) !== (state?.content.text?.[field.id] ?? field.defaultValue));
  const changes = changedText.length + uploads.length + deletes.length + Object.keys(replacements).length + Object.keys(mediaDraft).length;

  const publish = async () => {
    setBusy(true); setMessage("");
    try {
      const fileData = await Promise.all(uploads.map(async (item) => ({
        id: item.id, base64: await asBase64(item.file), width: item.width, height: item.height,
        category: item.category, title: item.title, addToGallery: item.addToGallery, galleryCategory: item.galleryCategory,
      })));
      const result = await api("publish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseHead: state.head, text: textDraft, mediaUpdates: mediaDraft, replacements, deletes, uploads: fileData }),
      });
      uploads.forEach((item) => URL.revokeObjectURL(item.preview));
      setUploads([]); setDeletes([]); setReplacements({}); setAutoReplacements([]); setMediaDraft({});
      const next = await api("state");
      setState(next); setTextDraft(next.content.text || {});
      setMessage(`Đã tạo phiên bản ${result.commit.slice(0, 8)}. Website sẽ cập nhật sau khi build và triển khai xong.`);
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
          <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>Xem trước ({changes})</button>
        </nav>
        {tab !== "preview" && <input type="search" placeholder="Tìm nội dung hoặc ảnh…" value={search} onChange={(event) => setSearch(event.target.value)} />}
      </div>
      {message && <div className={message.startsWith("Đã tạo") ? "admin-notice" : "admin-error"} role="status">{message}</div>}
      {tab === "text" && <div className="admin-content-list">
        {fieldMatches.map((field) => {
          const value = textDraft[field.id] ?? field.defaultValue;
          return <label className="admin-field" key={field.id}>
            <span><strong>{field.section}</strong><code>{field.id}</code></span>
            {field.defaultValue.length > 100 || value.includes("\n") ? <textarea rows="3" value={value} onChange={(event) => setTextDraft((old) => ({ ...old, [field.id]: event.target.value }))} /> : <input value={value} onChange={(event) => setTextDraft((old) => ({ ...old, [field.id]: event.target.value }))} />}
            {value !== field.defaultValue && <button type="button" onClick={() => setTextDraft((old) => { const next = { ...old }; delete next[field.id]; return next; })}>Khôi phục nội dung gốc</button>}
          </label>;
        })}
        {!fieldMatches.length && <p>Không tìm thấy nội dung.</p>}
      </div>}
      {tab === "media" && <div className="admin-media-panel">
        <label className="admin-upload">+ Thêm ảnh vào thư viện<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} /></label>
        <p className="admin-help">Ảnh xóa sẽ được thay tự động bằng ảnh khác cùng loại và tỷ lệ. Ảnh tài liệu, chứng nhận và logo cần chọn ảnh thay thế thủ công.</p>
        <div className="admin-media-grid">{mediaMatches.map((item) => {
          const uploaded = uploads.some((entry) => entry.id === item.id);
          const draft = mediaDraft[item.id] || {};
          const currentTarget = replacements[item.id] || state?.content.images?.[item.id]?.slice(8) || "";
          return <article className={`admin-media-card${deletes.includes(item.id) ? " is-deleted" : ""}`} key={item.id}>
            <img src={uploaded ? item.preview : item.src} alt={item.title || item.id} loading="lazy" />
            <div className="admin-media-fields">
              <small>{item.id} · {item.width} × {item.height}</small>
              <label>Tên ảnh<input value={uploaded ? item.title : draft.title ?? item.title ?? item.id} onChange={(event) => uploaded ? updateUpload(item.id, { title: event.target.value }) : setMediaDraft((old) => ({ ...old, [item.id]: { ...old[item.id], title: event.target.value } }))} /></label>
              <label>Nhóm để chọn ảnh thay thế<select value={uploaded ? item.category : draft.category ?? item.category} onChange={(event) => uploaded ? updateUpload(item.id, { category: event.target.value }) : setMediaDraft((old) => ({ ...old, [item.id]: { ...old[item.id], category: event.target.value } }))}>
                {[...new Set(["Suất ăn", "Không gian bếp", "Giao nhận", "Phục vụ", "Hoạt động", "Giải pháp", "Thư viện", "Tài liệu và nhận diện", "Khác", item.category])].map((value) => <option key={value}>{value}</option>)}
              </select></label>
              {uploaded && <label className="admin-check"><input type="checkbox" checked={item.addToGallery} onChange={(event) => updateUpload(item.id, { addToGallery: event.target.checked })} /> Hiển thị trong thư viện ảnh</label>}
              {uploaded && item.addToGallery && <label>Nhóm thư viện<select value={item.galleryCategory} onChange={(event) => updateUpload(item.id, { galleryCategory: event.target.value })}>{galleryCategories.map((value) => <option key={value}>{value}</option>)}</select></label>}
              {!uploaded && <label>Thay ảnh đang hiển thị bằng<select value={currentTarget} onChange={(event) => { setAutoReplacements((items) => items.filter((id) => id !== item.id)); setReplacements((old) => { const next = { ...old }; if (event.target.value) next[item.id] = event.target.value; else delete next[item.id]; return next; }); }}>
                <option value="">Giữ ảnh này</option>
                {media.filter((candidate) => candidate.id !== item.id && !deletes.includes(candidate.id)).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.title || candidate.id}</option>)}
              </select></label>}
              {uploaded ? <button type="button" onClick={() => removeUpload(item.id)}>Bỏ ảnh mới</button> : <label className="admin-check"><input type="checkbox" checked={deletes.includes(item.id)} onChange={() => toggleDelete(item.id)} /> Xóa ảnh này khi xuất bản</label>}
            </div>
          </article>;
        })}</div>
        {!mediaMatches.length && <p>Không tìm thấy ảnh.</p>}
      </div>}
      {tab === "preview" && <div className="admin-preview">
        <h2>Thay đổi trước khi xuất bản</h2>
        <p>Kiểm tra nội dung và ảnh ở đây trước khi tạo phiên bản mới.</p>
        <h3>Văn bản ({changedText.length})</h3>
        {changedText.map((field) => <div className="admin-preview-row" key={field.id}><small>{field.section} · {field.id}</small><p>{textDraft[field.id] ?? field.defaultValue}</p></div>)}
        <h3>Ảnh mới ({uploads.length})</h3>
        <div className="admin-preview-images">{uploads.map((item) => <figure key={item.id}><img src={item.preview} alt={item.title} /><figcaption>{item.title}</figcaption></figure>)}</div>
        <h3>Thay hoặc xóa ảnh ({deletes.length + Object.keys(replacements).length})</h3>
        {[...new Set([...deletes, ...Object.keys(replacements)])].map((id) => {
          const old = media.find((item) => item.id === id);
          const next = media.find((item) => item.id === replacements[id]);
          return <div className="admin-preview-row" key={id}><small>{id}</small><p>{deletes.includes(id) ? "Xóa" : "Thay"} → {replacements[id] || "Chưa chọn ảnh thay thế"}</p><div className="admin-preview-images">{old && <img src={old.src} alt={`Ảnh cũ ${id}`} />}{next && <img src={next.preview || next.src} alt={`Ảnh mới ${next.id}`} />}</div></div>;
        })}
        <h3>Thông tin ảnh ({Object.keys(mediaDraft).length})</h3>
        {Object.entries(mediaDraft).map(([id, values]) => <div className="admin-preview-row" key={id}><small>{id}</small><p>{values.title || media.find((item) => item.id === id)?.title || id} · {values.category || media.find((item) => item.id === id)?.category}</p></div>)}
      </div>}
      <footer className="admin-publish-bar"><span>{changes ? `${changes} thay đổi chưa xuất bản` : "Chưa có thay đổi"}</span><button type="button" onClick={publish} disabled={busy || !changes}>{busy ? "Đang xuất bản…" : "Xuất bản"}</button></footer>
    </main>
  );
}
