import re

path = "src/App.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Strip onsubmit
content = re.sub(r" onsubmit=\"[^\"]*\"", "", content)

injection = """
    // Backend API logic
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname')?.value;
        const phone = document.getElementById('phone')?.value;
        const cccd = document.getElementById('cccd')?.value || '';
        const address = document.getElementById('address')?.value;
        const title = document.getElementById('title')?.value;
        const category = document.getElementById('category')?.value;
        const content_val = document.getElementById('content')?.value;
        const fileInput = document.getElementById('fileInput');

        if (!fullname || !phone || !title || !content_val) {
          alert('Vui lòng điền đầy đủ các trường bắt buộc!');
          return;
        }

        const formData = new FormData();
        formData.append('fullName', fullname);
        formData.append('phone', phone);
        formData.append('cccd', cccd);
        formData.append('address', address);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('content', content_val);
        
        if (fileInput && fileInput.files) {
          for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('images', fileInput.files[i]);
          }
        }

        try {
          const res = await fetch('http://localhost:3001/api/petitions', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (res.ok) {
            alert('Gửi phản ánh thành công!');
            feedbackForm.reset();
            loadPetitions();
          } else {
            alert('Lỗi: ' + data.error);
          }
        } catch (error) {
          console.error(error);
          alert('Đã xảy ra lỗi khi kết nối tới máy chủ!');
        }
      });
    }

    const loadPetitions = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/petitions');
        const data = await res.json();
        const listContainer = document.querySelector('.petition-list');
        const adminTbody = document.querySelector('#adminPetitionsTbody');
        
        if (listContainer) {
          listContainer.innerHTML = '';
          data.forEach(p => {
             listContainer.innerHTML += `
               <div class="petition-item">
                 <div class="petition-status status-${p.status === 'pending' ? 'pending' : 'resolved'}">
                    ${p.status === 'pending' ? '⏳ Đang chờ xử lý' : '✅ Đã giải quyết'}
                 </div>
                 <h4 class="petition-title">${p.title}</h4>
                 <div class="petition-meta">Người gửi: ${p.fullName} | Ngày gửi: ${new Date(p.createdAt).toLocaleDateString()}</div>
                 <p class="petition-desc">${p.content.substring(0, 100)}...</p>
               </div>
             `;
          });
        }
        
        if (adminTbody) {
           adminTbody.innerHTML = '';
           data.forEach(p => {
             adminTbody.innerHTML += `
                <tr>
                   <td>${p.id}</td>
                   <td>${p.fullName}<br><small>${p.phone}</small></td>
                   <td>${p.title}</td>
                   <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                   <td><span class="badge ${p.status === 'pending' ? 'bg-warning' : 'bg-success'}">${p.status}</span></td>
                   <td><button class="admin-btn primary" onclick="alert('Xem chi tiết')">Xem</button></td>
                </tr>
             `;
           });
        }
      } catch (e) {
        console.error('Failed to load petitions:', e);
      }
    };
    
    loadPetitions();
"""

# Insert before the end of useEffect
content = content.replace("  }, []);", injection + "\n  }, []);")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
