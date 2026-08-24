import re

html_path = "/Users/macbookpro/MTTQ CamPha/ThamKhao/Cong_MTTQ_Cam_Pha_Quan_Tri_3.0 (1).html"
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

body_match = re.search(r"<body>(.*?)</body>", content, re.DOTALL)
body_html = body_match.group(1) if body_match else ""

# Remove scripts
body_html = re.sub(r"<script.*?>.*?</script>", "", body_html, flags=re.DOTALL)

# HTML to JSX basic conversions
jsx = body_html.replace('class="', 'className="')
jsx = jsx.replace('for="', 'htmlFor="')
jsx = jsx.replace('tabindex="', 'tabIndex="')
jsx = jsx.replace('onclick="', 'onClick="')
jsx = jsx.replace('onchange="', 'onChange="')
jsx = jsx.replace('maxlength="', 'maxLength="')
jsx = jsx.replace('accept-charset="', 'acceptCharset="')

# Self closing tags
jsx = re.sub(r"<(input[^>]*?)(?<!/)>", r"<\1 />", jsx)
jsx = re.sub(r"<(img[^>]*?)(?<!/)>", r"<\1 />", jsx)
jsx = jsx.replace("<br>", "<br />")
jsx = jsx.replace("<hr>", "<hr />")

# Inline styles
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
            jsx_rules.append(f"{k}: '{v}'")
    return "style={{" + ", ".join(jsx_rules) + "}}"

jsx = re.sub(r"style=\"([^\"]*)\"", style_replacer, jsx)

# Replace HTML comments
jsx = re.sub(r"<!--(.*?)-->", r"{/* \1 */}", jsx, flags=re.DOTALL)

# Instead of managing activeTab with react state by parsing the vanilla js, we'll just inject the HTML 
# and use a dangerouslySetInnerHTML or just raw JSX and let it be static, or add the state.
# Since the vanilla HTML relies on CSS classes `active` and JS to toggle tabs, I'll just write 
# it as a dumb component for now so it looks exactly like the reference.
# I'll just put the jsx in App.jsx.

app_jsx = f"""import React, {{ useEffect }} from "react";
import "./index.css";

function App() {{
  useEffect(() => {{
    // Re-implement the vanilla JS logic for tabs and modals
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach((item, index) => {{
        item.addEventListener('click', () => {{
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            item.classList.add('active');
            if(tabContents[index]) {{
                tabContents[index].classList.add('active');
            }}
        }});
    }});

    const adminBtn = document.querySelector('.btn-login');
    const adminOverlay = document.querySelector('.admin-overlay');
    const adminClose = document.querySelector('.admin-close');

    if (adminBtn && adminOverlay) {{
        adminBtn.addEventListener('click', (e) => {{
            e.preventDefault();
            adminOverlay.classList.add('active');
        }});
    }}

    if (adminClose && adminOverlay) {{
        adminClose.addEventListener('click', () => {{
            adminOverlay.classList.remove('active');
        }});
    }}
    
    const adminMenus = document.querySelectorAll('.admin-menu button');
    const adminSections = document.querySelectorAll('.admin-section');
    adminMenus.forEach((btn, index) => {{
        btn.addEventListener('click', () => {{
            adminMenus.forEach(b => b.classList.remove('active'));
            adminSections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            if(adminSections[index]) adminSections[index].classList.add('active');
        }});
    }});

    // Upload logic simulation
    const uploadArea = document.querySelector('.upload-area');
    if(uploadArea) {{
        uploadArea.addEventListener('click', () => {{
            alert('Chức năng tải lên file đang được phát triển!');
        }});
    }}
  }}, []);

  return (
    <>
      {jsx}
    </>
  );
}}

export default App;
"""

with open("/Users/macbookpro/MTTQ CamPha/Cong_MTTQ_Cam_Pha_Quan_Tri_3.0/src/App.jsx", "w", encoding="utf-8") as f:
    f.write(app_jsx)

print("App.jsx updated with full HTML.")
