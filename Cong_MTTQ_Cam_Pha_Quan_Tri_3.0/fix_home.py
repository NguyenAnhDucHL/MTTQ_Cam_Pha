import subprocess

# Get original App.jsx from git
result = subprocess.run(['git', 'show', 'HEAD:./src/App.jsx'], capture_output=True, text=True)
content = result.stdout

# Replace function App() with function Home()
content = content.replace('function App() {', 'function Home() {')
content = content.replace('export default App;', 'export default Home;')

# Remove adminBtn logic
admin_btn_start = content.find('const adminBtn = document.querySelector(\'.btn-login\');')
admin_btn_end = content.find('const uploadArea = document.querySelector(\'.upload-area\');')
if admin_btn_start != -1 and admin_btn_end != -1:
    content = content[:admin_btn_start] + content[admin_btn_end:]

# Remove adminList logic
admin_list_start = content.find('if (adminList) {')
admin_list_end = content.find('} catch (e) {')
if admin_list_start != -1 and admin_list_end != -1:
    # Find the closing brace of the if block before catch
    content = content[:admin_list_start] + content[admin_list_end:]

# Remove Admin Overlay JSX
admin_overlay_start = content.find('{/* Admin Overlay */}')
admin_overlay_end = content.find('{/* Login Modal */}')
if admin_overlay_start != -1 and admin_overlay_end != -1:
    content = content[:admin_overlay_start] + content[admin_overlay_end:]

# Remove Login Modal JSX
login_modal_start = content.find('{/* Login Modal */}')
login_modal_end = content.find('</>', login_modal_start)
if login_modal_start != -1 and login_modal_end != -1:
    content = content[:login_modal_start] + content[login_modal_end:]

with open('src/pages/Home.jsx', 'w') as f:
    f.write(content)
