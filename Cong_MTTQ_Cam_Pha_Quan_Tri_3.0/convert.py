import re
import os

html_path = "/Users/macbookpro/MTTQ CamPha/ThamKhao/Cong_MTTQ_Cam_Pha_Quan_Tri_3.0 (1).html"
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract body
body_match = re.search(r"<body>(.*?)</body>", content, re.DOTALL)
if not body_match:
    print("Body not found")
    exit(1)

body_html = body_match.group(1)

# Basic JSX conversions
jsx = body_html.replace("class=", "className=")
jsx = jsx.replace("for=", "htmlFor=")
jsx = jsx.replace("tabindex=", "tabIndex=")
jsx = jsx.replace("onclick=", "onClick=")
jsx = jsx.replace("onchange=", "onChange=")
jsx = jsx.replace("maxlength=", "maxLength=")
jsx = jsx.replace("accept-charset=", "acceptCharset=")

# Fix self-closing tags
jsx = re.sub(r"<(input[^>]*?)(?<!/)>", r"<\1 />", jsx)
jsx = re.sub(r"<(img[^>]*?)(?<!/)>", r"<\1 />", jsx)
jsx = jsx.replace("<br>", "<br />")
jsx = jsx.replace("<hr>", "<hr />")

# There is a script tag at the bottom of the body. We should remove it.
jsx = re.sub(r"<script(.*?)</script>", "", jsx, flags=re.DOTALL)

# Fix inline styles (very basic)
def style_replacer(match):
    style_str = match.group(1)
    rules = style_str.split(";")
    jsx_rules = []
    for rule in rules:
        if ":" in rule:
            k, v = rule.split(":", 1)
            k = k.strip()
            v = v.strip().replace("\"", "'")
            # camelCase the key
            parts = k.split("-")
            k = parts[0] + "".join(x.title() for x in parts[1:])
            jsx_rules.append(f"{k}: \"{v}\"")
    return "style={{" + ", ".join(jsx_rules) + "}}"

jsx = re.sub(r"style=\"([^\"]*)\"", style_replacer, jsx)

# Replace HTML comments
jsx = re.sub(r"<!--(.*?)-->", r"{/* \1 */}", jsx, flags=re.DOTALL)

# Create App.jsx
app_jsx = f"""import React, {{ useState }} from "react";
import "./index.css";

function App() {{
  const [activeTab, setActiveTab] = useState("form-tab");
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      {{/* Header Section */}}
      <header className="header-top">
        <div className="header-container">
          <div className="brand-info">
            <div className="logo-emblem">
              <img src="/logo.png" className="mttq-logo" alt="Logo MTTQ" />
            </div>
            <div className="brand-text">
              <h1>Cổng Tiếp Nhận Phản Ánh, Kiến Nghị</h1>
              <p>Ủy ban MTTQ Việt Nam Phường Cẩm Phả</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-login" onClick={{() => setShowAdmin(true)}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Đăng nhập Admin
            </button>
          </div>
        </div>
      </header>

      {{/* Main Nav */}}
      <nav className="main-nav">
        <div className="nav-container">
          <div className={{`nav-item ${{activeTab === 'form-tab' ? 'active' : ''}}`}} onClick={{() => setActiveTab('form-tab')}}>
            Gửi phản ánh
          </div>
          <div className={{`nav-item ${{activeTab === 'list-tab' ? 'active' : ''}}`}} onClick={{() => setActiveTab('list-tab')}}>
            Danh sách ý kiến
          </div>
          <div className={{`nav-item ${{activeTab === 'track-tab' ? 'active' : ''}}`}} onClick={{() => setActiveTab('track-tab')}}>
            Tra cứu kết quả
          </div>
          <div className={{`nav-item ${{activeTab === 'doc-tab' ? 'active' : ''}}`}} onClick={{() => setActiveTab('doc-tab')}}>
            Văn bản hướng dẫn
          </div>
        </div>
      </nav>

      <main className="main-wrapper">
        {{/* Form Tab */}}
        <div id="form-tab" className={{`tab-content ${{activeTab === 'form-tab' ? 'active' : ''}}`}}>
          <h2 className="section-title">Gửi Phản Ánh, Kiến Nghị Mới</h2>
          <div className="card">
            <h3 className="card-header">Thông tin người gửi</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Họ và tên <span className="required">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập họ và tên..." />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại <span className="required">*</span></label>
                <input type="tel" className="form-control" placeholder="Nhập số điện thoại..." />
              </div>
              <div className="form-group">
                <label className="form-label">CCCD/CMND</label>
                <input type="text" className="form-control" placeholder="Nhập số CCCD (không bắt buộc)" />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ <span className="required">*</span></label>
                <input type="text" className="form-control" placeholder="Nhập địa chỉ cư trú..." />
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="card-header">Nội dung phản ánh</h3>
            <div className="form-group">
              <label className="form-label">Tiêu đề <span className="required">*</span></label>
              <input type="text" className="form-control" placeholder="Tóm tắt nội dung phản ánh..." />
            </div>
            <div className="form-group">
              <label className="form-label">Lĩnh vực <span className="required">*</span></label>
              <select className="form-select">
                <option value="">-- Chọn lĩnh vực --</option>
                <option value="1">Đất đai, môi trường</option>
                <option value="2">Trật tự đô thị, an toàn giao thông</option>
                <option value="3">Chế độ chính sách, bảo trợ xã hội</option>
                <option value="4">An ninh trật tự</option>
                <option value="5">Thái độ cán bộ, công chức</option>
                <option value="6">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung chi tiết <span className="required">*</span></label>
              <textarea className="form-control" rows="5" placeholder="Trình bày chi tiết sự việc..."></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Đính kèm hình ảnh/Tài liệu</label>
              <div className="upload-area">
                <div className="upload-icon">📁</div>
                <p>Nhấp hoặc kéo thả file vào đây (Tối đa 5MB/file)</p>
              </div>
            </div>
            <button className="btn-submit">
              Gửi Phản Ánh
            </button>
          </div>
        </div>

        {{/* List Tab */}}
        <div id="list-tab" className={{`tab-content ${{activeTab === 'list-tab' ? 'active' : ''}}`}}>
          <h2 className="section-title">Danh Sách Ý Kiến, Phản Ánh</h2>
          <div className="filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" className="form-control" placeholder="Tìm kiếm theo tiêu đề..." />
            </div>
            <select className="form-select" style={{width: 'auto'}}>
              <option value="">Tất cả lĩnh vực</option>
              <option value="1">Đất đai, môi trường</option>
            </select>
            <select className="form-select" style={{width: 'auto'}}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang giải quyết</option>
              <option value="completed">Đã giải quyết</option>
            </select>
          </div>
          <div className="petition-list">
            <div className="petition-item">
              <div className="petition-header">
                <div className="petition-title">Hệ thống thoát nước tổ 3 khu 4 bị tắc nghẽn nghiêm trọng</div>
                <span className="status-badge status-completed">Đã giải quyết</span>
              </div>
              <div className="petition-meta">
                <span>👤 Nguyễn Văn A</span>
                <span>📅 15/10/2023</span>
                <span>🏷️ Trật tự đô thị</span>
              </div>
              <div className="petition-desc">
                Cống thoát nước đoạn qua số nhà 15-20 tổ 3 khu 4 đã bị tắc nghẽn hơn 1 tháng nay, gây ngập úng cục bộ và bốc mùi hôi thối, ảnh hưởng nghiêm trọng đến sinh hoạt của người dân.
              </div>
              <div className="petition-footer">
                <span className="code-tag">Mã: CP-1510-001</span>
                <span>Phản hồi: 18/10/2023</span>
              </div>
            </div>
            {{/* Additional petition items... */}}
          </div>
        </div>

        {{/* Track Tab */}}
        <div id="track-tab" className={{`tab-content ${{activeTab === 'track-tab' ? 'active' : ''}}`}}>
           <h2 className="section-title">Tra Cứu Kết Quả Giải Quyết</h2>
           <div className="card">
               <div className="form-group">
                   <label className="form-label">Nhập mã tra cứu <span className="required">*</span></label>
                   <div style={{display: 'flex', gap: '10px'}}>
                       <input type="text" className="form-control" placeholder="Ví dụ: CP-1510-001" />
                       <button className="btn-submit" style={{width: 'auto', padding: '10px 24px'}}>Tra cứu</button>
                   </div>
               </div>
           </div>
        </div>

        {{/* Doc Tab */}}
        <div id="doc-tab" className={{`tab-content ${{activeTab === 'doc-tab' ? 'active' : ''}}`}}>
           <h2 className="section-title">Văn Bản Hướng Dẫn</h2>
           <div className="doc-list">
               <div className="doc-item">
                   <div className="doc-info">
                       <h4>Quy chế tiếp công dân và xử lý đơn khiếu nại, tố cáo, kiến nghị, phản ánh</h4>
                       <p>Ban hành kèm theo Quyết định số 123/QĐ-UBND ngày 01/01/2023</p>
                   </div>
                   <a href="#" className="btn-download">Tải về</a>
               </div>
           </div>
        </div>
      </main>

      <footer>
        <div className="footer-container">
          <div>
            <h4 className="footer-title">Ủy ban MTTQ Việt Nam Phường Cẩm Phả</h4>
            <p>Địa chỉ: Số 123, Đường ABC, Phường Cẩm Phả, TP Cẩm Phả, Quảng Ninh</p>
            <p>Điện thoại: 0203.3.123.456</p>
            <p>Email: mttq.campha@quangninh.gov.vn</p>
          </div>
          <div>
            <h4 className="footer-title">Liên kết nhanh</h4>
            <p><a href="#" style={{color: '#cbd5e1', textDecoration: 'none'}}>Cổng TTĐT TP Cẩm Phả</a></p>
            <p><a href="#" style={{color: '#cbd5e1', textDecoration: 'none'}}>Mặt trận Tổ quốc Tỉnh Quảng Ninh</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2023 Ủy ban MTTQ Việt Nam Phường Cẩm Phả.
        </div>
      </footer>

      {{/* Admin Overlay */}}
      {{showAdmin && (
        <div className="admin-overlay active" id="adminModal">
          <div className="admin-card">
            <div className="admin-head">
              <h2>HỆ THỐNG QUẢN TRỊ CMS 2.0 - MTTQ CẨM PHẢ</h2>
              <button className="admin-close" onClick={{() => setShowAdmin(false)}}>Đóng ✖</button>
            </div>
            <div className="admin-body">
              <div className="admin-menu">
                <button className="active">Tổng quan</button>
                <button>Quản lý Phản ánh</button>
                <button>Quản lý Người dùng</button>
                <button>Cấu hình hệ thống</button>
              </div>
              <div className="admin-main">
                <div className="admin-section active">
                  <h3>Tổng quan hệ thống</h3>
                  <div className="admin-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px'}}>
                     <div className="admin-stat">Số phản ánh mới<strong>12</strong></div>
                     <div className="admin-stat">Đang xử lý<strong>5</strong></div>
                     <div className="admin-stat">Đã giải quyết<strong>148</strong></div>
                     <div className="admin-stat">Tổng số<strong>165</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}}
    </>
  );
}}

export default App;
"""

app_path = "/Users/macbookpro/MTTQ CamPha/Cong_MTTQ_Cam_Pha_Quan_Tri_3.0/src/App.jsx"
with open(app_path, "w", encoding="utf-8") as f:
    f.write(app_jsx)

print("App.jsx created.")
