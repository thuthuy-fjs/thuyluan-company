"use client";

import { useState } from "react";

const fileSrc = (image, media) => {
  const item = media.find((entry) => entry.src === image || `/assets/${entry.id}` === image);
  return item?.preview || (item?.id.startsWith("upload-") ? `/api/admin/asset/${item.id}` : item?.src) || image;
};

export default function CertificateManager({ certificates, media, search, onChange, onAdd, onReplacePage, onAddPages, onRemove }) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const visible = certificates.filter((item) => `${item.title} ${item.pages.map((page) => page.title).join(" ")}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const update = (id, patch) => onChange(certificates.map((item) => item.id === id ? { ...item, ...patch } : item));
  const updatePage = (certificate, index, patch) => update(certificate.id, { pages: certificate.pages.map((page, position) => position === index ? { ...page, ...patch } : page) });
  const movePage = (certificate, index, direction) => {
    const pages = [...certificate.pages];
    const [page] = pages.splice(index, 1);
    pages.splice(index + direction, 0, page);
    update(certificate.id, { pages });
  };
  return <section className="admin-certificates" aria-label="Chứng chỉ – Chứng nhận">
    <div className="admin-certificates-heading"><div><h2>Chứng chỉ – Chứng nhận</h2><p>Mỗi chứng nhận là một bộ trang. Ảnh ngoài thẻ lấy từ trang đầu.</p></div><button type="button" onClick={() => setCreating((value) => !value)}>{creating ? "Đóng" : "+ Thêm chứng nhận"}</button></div>
    {creating && <form className="admin-certificate-create" onSubmit={async (event) => {
      event.preventDefault();
      setBusy(true);
      const added = await onAdd({ title: title.trim(), files });
      setBusy(false);
      if (added) { setCreating(false); setTitle(""); setFiles([]); }
    }}>
      <h3>Chứng nhận mới</h3>
      <label>Tên chứng nhận<input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} required /></label>
      <label>Các trang theo thứ tự hiển thị<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setFiles([...event.target.files])} required /></label>
      {files.length > 0 && <ol>{files.map((file, index) => <li key={`${file.name}-${index}`}>{file.name}</li>)}</ol>}
      <p>Chọn 1–4 ảnh trong lần đầu. Có thể thêm trang sau khi tạo.</p>
      <button type="submit" disabled={busy || !files.length}>{busy ? "Đang xử lý…" : "Tạo chứng nhận"}</button>
    </form>}
    <div className="admin-certificate-list">
      {visible.map((certificate) => <details className="admin-certificate-item" key={certificate.id}>
        <summary><img src={fileSrc(certificate.pages[0].image, media)} alt="" /><span><strong>{certificate.title}</strong><small>{certificate.pages.length} trang</small></span><span aria-hidden="true">⌄</span></summary>
        <div className="admin-certificate-fields">
          <label>Tên chứng nhận<input value={certificate.title} maxLength={200} onChange={(event) => update(certificate.id, { title: event.target.value })} /></label>
          <div className="admin-certificate-pages">{certificate.pages.map((page, index) => <div className="admin-certificate-page" key={`${certificate.id}-${index}`}>
            <img src={fileSrc(page.image, media)} alt={`${certificate.title} · trang ${index + 1}`} />
            <div><strong>Trang {index + 1}{index === 0 ? " · ảnh ngoài thẻ" : ""}</strong><label>Tên trang<input value={page.title} maxLength={120} onChange={(event) => updatePage(certificate, index, { title: event.target.value })} /></label><div className="admin-certificate-page-actions"><label className="admin-certificate-file">Thay ảnh trang này<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { if (event.target.files?.[0]) onReplacePage(certificate.id, index, event.target.files[0]); event.target.value = ""; }} /></label><button type="button" disabled={index === 0} onClick={() => movePage(certificate, index, -1)}>↑ Lên</button><button type="button" disabled={index === certificate.pages.length - 1} onClick={() => movePage(certificate, index, 1)}>↓ Xuống</button></div></div>
          </div>)}</div>
          {certificate.pages.length < 12 && <label className="admin-certificate-file">+ Thêm trang<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => { if (event.target.files?.length) onAddPages(certificate.id, [...event.target.files]); event.target.value = ""; }} /></label>}
          <button className="admin-certificate-remove" type="button" onClick={() => onRemove(certificate.id)}>Xóa chứng nhận</button>
        </div>
      </details>)}
      {!visible.length && <p>Không tìm thấy chứng nhận.</p>}
    </div>
  </section>;
}
