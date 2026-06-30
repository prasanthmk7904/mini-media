// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id: 'u1', name: 'Aarav Mehta', handle: 'aarav_m', email: 'aarav@demo.com', password: 'demo123', bio: 'Building things on the web 🌐', avatarColor: 0, following: [], followers: [] },
  { id: 'u2', name: 'Priya Nair', handle: 'priyacodes', email: 'priya@demo.com', password: 'demo123', bio: 'UI/UX designer · coffee enthusiast ☕', avatarColor: 1, following: [], followers: [] },
  { id: 'u3', name: 'Rohan Iyer', handle: 'rohan_dev', email: 'rohan@demo.com', password: 'demo123', bio: 'Full-stack dev. Open source contributor.', avatarColor: 2, following: [], followers: [] },
  { id: 'u4', name: 'Sneha Kapoor', handle: 'sneha.k', email: 'sneha@demo.com', password: 'demo123', bio: 'Photographer 📸 | Traveler ✈️', avatarColor: 3, following: [], followers: [] }
];

const SEED_POSTS = [
  { id: 'p1', authorId: 'u1', content: 'Just deployed my first full-stack app! The feeling when it finally works in production 🚀', timestamp: Date.now() - 3600000 * 5, likes: ['u2','u3'], comments: [{ id:'c1', authorId:'u2', text:'Congrats! What stack did you use?', timestamp: Date.now()-3500000 }] },
  { id: 'p2', authorId: 'u2', content: 'Hot take: dark mode should be the default, not the option. Fight me. 🌙', timestamp: Date.now() - 3600000 * 8, likes: ['u1','u3','u4'], comments: [] },
  { id: 'p3', authorId: 'u3', content: 'Spent the whole weekend debugging a CSS issue that turned out to be a missing semicolon. Classic.', timestamp: Date.now() - 3600000 * 20, likes: ['u1'], comments: [{ id:'c2', authorId:'u1', text:'We\'ve all been there 😂', timestamp: Date.now()-3600000*19 }] },
  { id: 'p4', authorId: 'u4', content: 'Sunset over the mountains today. Sometimes you just need to unplug for a bit. 🌄', timestamp: Date.now() - 3600000 * 30, likes: ['u2'], comments: [] }
];

const AVATAR_COLORS = ['#4f8ef7','#f43f8e','#10b981','#f59e0b','#7c3aed','#06b6d4'];

// ─── STATE ────────────────────────────────────────────────────────────────────
function loadUsers() {
  let users = JSON.parse(localStorage.getItem('pf_users') || 'null');
  if (!users) { users = SEED_USERS; localStorage.setItem('pf_users', JSON.stringify(users)); }
  return users;
}
function saveUsers(users) { localStorage.setItem('pf_users', JSON.stringify(users)); }

function loadPosts() {
  let posts = JSON.parse(localStorage.getItem('pf_posts') || 'null');
  if (!posts) { posts = SEED_POSTS; localStorage.setItem('pf_posts', JSON.stringify(posts)); }
  return posts;
}
function savePosts(posts) { localStorage.setItem('pf_posts', JSON.stringify(posts)); }

let users = loadUsers();
let posts = loadPosts();
let currentUser = JSON.parse(localStorage.getItem('pf_current_user') || 'null'); // {id}
let activeProfileId = null;
let activeCommentsPostId = null;

function me() { return currentUser ? users.find(u => u.id === currentUser.id) : null; }
function userById(id) { return users.find(u => u.id === id); }
function avatarStyle(user) { return `background:${AVATAR_COLORS[user.avatarColor % AVATAR_COLORS.length]}`; }
function initials(name) { return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  renderFeed();
  renderExplore();
  renderSuggestions();
  updateAuthUI();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function openAuth(tab) { closeUserMenu(); openModal('authModal'); switchAuthTab(tab); }
function switchAuthTab(tab) {
  document.getElementById('loginForm').style.display = tab==='login'?'block':'none';
  document.getElementById('registerForm').style.display = tab==='register'?'block':'none';
  document.getElementById('loginTab').classList.toggle('active', tab==='login');
  document.getElementById('registerTab').classList.toggle('active', tab==='register');
}

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) { document.getElementById('loginError').classList.add('show'); return; }
  document.getElementById('loginError').classList.remove('show');
  currentUser = { id: user.id };
  localStorage.setItem('pf_current_user', JSON.stringify(currentUser));
  updateAuthUI(); closeModal('authModal'); renderFeed(); renderExplore(); renderSuggestions();
  showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
}

function register() {
  const name = document.getElementById('regName').value.trim();
  const handleRaw = document.getElementById('regHandle').value.trim().replace(/\s+/g,'').replace(/^@/,'');
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  let valid = true;

  document.getElementById('regNameError').classList.toggle('show', !name); if(!name) valid=false;
  const handleDup = users.some(u => u.handle.toLowerCase() === handleRaw.toLowerCase());
  document.getElementById('regHandleError').classList.toggle('show', !handleRaw || handleDup); if(!handleRaw||handleDup) valid=false;
  const emailDup = users.some(u => u.email === email);
  document.getElementById('regEmailError').classList.toggle('show', !email || emailDup); if(!email||emailDup) valid=false;
  document.getElementById('regPassError').classList.toggle('show', pass.length<6); if(pass.length<6) valid=false;
  if (!valid) return;

  const newUser = {
    id: 'u' + Date.now(), name, handle: handleRaw, email, password: pass,
    bio: 'New to PulseFeed 🎉', avatarColor: users.length % AVATAR_COLORS.length,
    following: [], followers: []
  };
  users.push(newUser); saveUsers(users);
  currentUser = { id: newUser.id };
  localStorage.setItem('pf_current_user', JSON.stringify(currentUser));
  updateAuthUI(); closeModal('authModal'); renderFeed(); renderExplore(); renderSuggestions();
  showToast(`Welcome to PulseFeed, ${name.split(' ')[0]}! 🎉`);
}

function logout() {
  currentUser = null; localStorage.removeItem('pf_current_user');
  updateAuthUI(); closeUserMenu(); showView('feed'); renderFeed(); renderExplore(); renderSuggestions();
  showToast('Signed out successfully.');
}

function updateAuthUI() {
  const u = me();
  const loggedIn = !!u;
  document.getElementById('userLabel').textContent = loggedIn ? u.name.split(' ')[0] : 'Sign In';
  document.getElementById('dropdownLoggedIn').style.display = loggedIn ? 'block' : 'none';
  document.getElementById('dropdownGuest').style.display = loggedIn ? 'none' : 'block';
  document.getElementById('composerLocked').style.display = loggedIn ? 'none' : 'flex';
  document.getElementById('composerOpen').style.display = loggedIn ? 'block' : 'none';
  document.getElementById('miniProfileEmpty').style.display = loggedIn ? 'none' : 'block';
  document.getElementById('miniProfileFull').style.display = loggedIn ? 'block' : 'none';

  ['userAvatar','dropdownAvatar','composerAvatar','miniAvatarLg','commentAvatar'].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    if (loggedIn) { el.textContent = initials(u.name); el.style.cssText += avatarStyle(u); }
  });

  if (loggedIn) {
    document.getElementById('dropdownName').textContent = u.name;
    document.getElementById('dropdownHandle').textContent = '@' + u.handle;
    document.getElementById('miniProfileName').textContent = u.name;
    document.getElementById('miniProfileHandle').textContent = '@' + u.handle;
    document.getElementById('miniPostCount').textContent = posts.filter(p=>p.authorId===u.id).length;
    document.getElementById('miniFollowerCount').textContent = u.followers.length;
    document.getElementById('miniFollowingCount').textContent = u.following.length;
  }
}

// ─── VIEW SWITCHING ─────────────────────────────────────────────────────────────
function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(view + 'View').classList.add('active');
  document.getElementById('navHome').classList.toggle('active', view==='feed');
  document.getElementById('navExplore').classList.toggle('active', view==='explore');
  window.scrollTo({top:0, behavior:'smooth'});
}
function goHome() { showView('feed'); }

// ─── TIME FORMAT ────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff/60000), hr = Math.floor(diff/3600000), day = Math.floor(diff/86400000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

// ─── POST RENDERING ──────────────────────────────────────────────────────────────
function postCardHTML(post) {
  const author = userById(post.authorId);
  if (!author) return '';
  const u = me();
  const liked = u && post.likes.includes(u.id);
  return `
    <div class="post-card">
      <div class="post-header">
        <div class="mini-avatar" style="${avatarStyle(author)}">${initials(author.name)}</div>
        <div class="post-author-info">
          <div class="post-author-name" onclick="viewProfile('${author.id}')">${author.name}</div>
          <div class="post-meta">@${author.handle} · ${timeAgo(post.timestamp)}</div>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      <div class="post-actions">
        <button class="post-action ${liked?'liked':''}" onclick="toggleLike('${post.id}')">
          <span class="like-icon">${liked?'❤️':'🤍'}</span> ${post.likes.length}
        </button>
        <button class="post-action" onclick="openComments('${post.id}')">
          💬 ${post.comments.length}
        </button>
      </div>
    </div>`;
}

function escapeHtml(s) {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

function renderFeed() {
  const container = document.getElementById('postsContainer');
  const u = me();
  let list = [...posts].sort((a,b)=>b.timestamp-a.timestamp);
  if (u && u.following.length) {
    const followingSet = new Set([...u.following, u.id]);
    const followingPosts = list.filter(p => followingSet.has(p.authorId));
    if (followingPosts.length) list = followingPosts;
  }
  container.innerHTML = list.length ? list.map(postCardHTML).join('') : '<div class="empty-state">No posts yet. Follow people or check Explore! 🔭</div>';
}

function renderExplore() {
  const q = (document.getElementById('exploreSearch')?.value || '').toLowerCase();
  const container = document.getElementById('exploreContainer');
  let list = [...posts].sort((a,b)=>b.timestamp-a.timestamp);
  if (q) {
    list = list.filter(p => {
      const author = userById(p.authorId);
      return p.content.toLowerCase().includes(q) || author?.name.toLowerCase().includes(q) || author?.handle.toLowerCase().includes(q);
    });
  }
  container.innerHTML = list.length ? list.map(postCardHTML).join('') : '<div class="empty-state">No results found.</div>';
}
function filterExplore() { renderExplore(); }

function renderSuggestions() {
  const u = me();
  const container = document.getElementById('suggestionsContainer');
  let candidates = users.filter(x => !u || (x.id !== u.id && !u.following.includes(x.id)));
  candidates = candidates.slice(0, 4);
  container.innerHTML = candidates.length ? candidates.map(c => `
    <div class="suggestion-item">
      <div class="mini-avatar sm" style="${avatarStyle(c)}">${initials(c.name)}</div>
      <div class="suggestion-info">
        <div class="suggestion-name" onclick="viewProfile('${c.id}')">${c.name}</div>
        <div class="suggestion-handle">@${c.handle}</div>
      </div>
      <button class="btn-follow" onclick="toggleFollow('${c.id}')">Follow</button>
    </div>`).join('') : '<div style="color:var(--muted);font-size:0.82rem">No suggestions right now.</div>';
}

// ─── POSTING ────────────────────────────────────────────────────────────────────
function updateCharCount() {
  const input = document.getElementById('postInput');
  document.getElementById('charCount').textContent = 280 - input.value.length;
}

function createPost() {
  const u = me();
  if (!u) return;
  const input = document.getElementById('postInput');
  const text = input.value.trim();
  if (!text) return;
  posts.unshift({ id: 'p'+Date.now(), authorId: u.id, content: text, timestamp: Date.now(), likes: [], comments: [] });
  savePosts(posts);
  input.value = '';
  updateCharCount();
  renderFeed(); renderExplore(); updateAuthUI();
  showToast('Posted! 🎉');
}

// ─── LIKES ─────────────────────────────────────────────────────────────────────
function toggleLike(postId) {
  const u = me();
  if (!u) { openAuth('login'); return; }
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const idx = post.likes.indexOf(u.id);
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(u.id);
  savePosts(posts);
  renderFeed(); renderExplore();
  if (document.getElementById('profileView').classList.contains('active')) renderProfilePosts();
  if (document.getElementById('commentsModal').classList.contains('show')) renderCommentsModal();
}

// ─── COMMENTS ───────────────────────────────────────────────────────────────────
function openComments(postId) {
  activeCommentsPostId = postId;
  renderCommentsModal();
  openModal('commentsModal');
}

function renderCommentsModal() {
  const post = posts.find(p => p.id === activeCommentsPostId);
  if (!post) return;
  document.getElementById('commentsPostDetail').innerHTML = postCardHTML(post).replace('<div class="post-actions">','<div class="post-actions" style="display:none">');
  document.getElementById('commentsList').innerHTML = post.comments.length
    ? post.comments.map(c => {
        const author = userById(c.authorId);
        return `<div class="comment-item">
          <div class="mini-avatar sm" style="${avatarStyle(author)}">${initials(author.name)}</div>
          <div class="comment-bubble">
            <span class="comment-author">${author.name}</span>
            <div class="comment-text">${escapeHtml(c.text)}</div>
            <div class="comment-time">${timeAgo(c.timestamp)}</div>
          </div>
        </div>`;
      }).join('')
    : '<div style="color:var(--muted);font-size:0.85rem;text-align:center;padding:1rem 0">No comments yet. Be the first!</div>';

  const u = me();
  document.getElementById('commentComposer').style.display = u ? 'flex' : 'none';
}

function submitComment() {
  const u = me();
  if (!u) { openAuth('login'); return; }
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if (!text) return;
  const post = posts.find(p => p.id === activeCommentsPostId);
  post.comments.push({ id: 'c'+Date.now(), authorId: u.id, text, timestamp: Date.now() });
  savePosts(posts);
  input.value = '';
  renderCommentsModal(); renderFeed(); renderExplore();
}

// ─── FOLLOW SYSTEM ────────────────────────────────────────────────────────────
function toggleFollow(targetId) {
  const u = me();
  if (!u) { openAuth('login'); return; }
  if (u.id === targetId) return;
  const target = userById(targetId);
  const idx = u.following.indexOf(targetId);
  if (idx >= 0) {
    u.following.splice(idx, 1);
    target.followers.splice(target.followers.indexOf(u.id), 1);
    showToast(`Unfollowed @${target.handle}`);
  } else {
    u.following.push(targetId);
    target.followers.push(u.id);
    showToast(`Following @${target.handle} ✓`);
  }
  saveUsers(users);
  renderSuggestions(); renderFeed(); updateAuthUI();
  if (document.getElementById('profileView').classList.contains('active')) renderProfileHeader();
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function viewProfile(userId) {
  activeProfileId = userId;
  showView('profile');
  switchProfileTab('posts');
  renderProfileHeader();
  renderProfilePosts();
}
function openMyProfile() {
  closeUserMenu();
  const u = me();
  if (!u) { openAuth('login'); return; }
  viewProfile(u.id);
}

function renderProfileHeader() {
  const user = userById(activeProfileId);
  const u = me();
  const isMe = u && u.id === user.id;
  const isFollowing = u && u.following.includes(user.id);
  document.getElementById('profileHeader').innerHTML = `
    <div class="mini-avatar xl" style="${avatarStyle(user)};margin:0 auto 0.75rem">${initials(user.name)}</div>
    <div style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:700">${user.name}</div>
    <div style="color:var(--muted);font-size:0.88rem">@${user.handle}</div>
    <div class="profile-bio">${escapeHtml(user.bio)}</div>
    <div class="profile-stats-row">
      <div><strong>${posts.filter(p=>p.authorId===user.id).length}</strong><span>Posts</span></div>
      <div><strong>${user.followers.length}</strong><span>Followers</span></div>
      <div><strong>${user.following.length}</strong><span>Following</span></div>
    </div>
    ${isMe ? '' : `<button class="btn-follow ${isFollowing?'following':''}" onclick="toggleFollow('${user.id}')" style="padding:0.6rem 1.5rem">${isFollowing?'✓ Following':'+ Follow'}</button>`}
  `;
}

function switchProfileTab(tab) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('profile' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Container').classList.add('active');
  if (tab === 'posts') renderProfilePosts();
  if (tab === 'followers') renderProfileFollowList('followers');
  if (tab === 'following') renderProfileFollowList('following');
}

function renderProfilePosts() {
  const list = posts.filter(p => p.authorId === activeProfileId).sort((a,b)=>b.timestamp-a.timestamp);
  document.getElementById('profilePostsContainer').innerHTML = list.length
    ? list.map(postCardHTML).join('')
    : '<div class="empty-state">No posts yet.</div>';
}

function renderProfileFollowList(type) {
  const user = userById(activeProfileId);
  const ids = user[type];
  const container = document.getElementById('profile' + type.charAt(0).toUpperCase() + type.slice(1) + 'Container');
  if (!ids.length) { container.innerHTML = `<div class="empty-state">No ${type} yet.</div>`; return; }
  const u = me();
  container.innerHTML = ids.map(id => {
    const person = userById(id);
    if (!person) return '';
    const isFollowing = u && u.following.includes(person.id);
    const isMe = u && u.id === person.id;
    return `<div class="follow-list-item">
      <div class="mini-avatar" style="${avatarStyle(person)}">${initials(person.name)}</div>
      <div class="follow-list-info">
        <div class="follow-list-name" onclick="viewProfile('${person.id}')">${person.name}</div>
        <div class="follow-list-handle">@${person.handle}</div>
      </div>
      ${isMe ? '' : `<button class="btn-follow ${isFollowing?'following':''}" onclick="toggleFollow('${person.id}')">${isFollowing?'✓ Following':'+ Follow'}</button>`}
    </div>`;
  }).join('');
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('show'); document.getElementById('overlay').classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); document.getElementById('overlay').classList.remove('show'); }
function closeAll() { document.querySelectorAll('.modal-backdrop').forEach(m=>m.classList.remove('show')); document.getElementById('overlay').classList.remove('show'); closeUserMenu(); }

function toggleUserMenu() { document.getElementById('userDropdown').classList.toggle('show'); }
function closeUserMenu() { document.getElementById('userDropdown').classList.remove('show'); }
document.addEventListener('click', e => {
  if (!e.target.closest('#userBtn') && !e.target.closest('#userDropdown')) closeUserMenu();
});

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const tc = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast success';
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(()=>t.remove(), 2700);
}

init();
