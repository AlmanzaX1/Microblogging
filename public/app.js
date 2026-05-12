// ===== AUTH =====
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')) || {}; }
    catch { return {}; }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.replace('login.html');
}

// ===== ESTADO GLOBAL =====
const state = {
    posts: [],
    page: 1,
    total: 0,
    activeTag: null,
    searchQuery: '',
    currentView: 'feed',
};

// ===== COLORES PARA AVATARES =====
const AVATAR_COLORS = [
    '#1d9bf0','#7856ff','#ff6b35','#00ba7c',
    '#f91880','#ffd400','#ff7043','#26c6da',
    '#ab47bc','#ec407a','#5c6bc0','#26a69a',
];

function avatarColor(str = '') {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

// ===== FORMATO DE TIEMPO RELATIVO =====
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)    return 'ahora';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ===== DETECCIÓN DE TIPO DE MEDIA =====
function mediaType(url = '') {
    if (url.match(/\.(mp4|webm|mov)$/i)) return 'video';
    if (url.match(/\.(mp3|ogg|wav)$/i))  return 'audio';
    return 'image';
}

// ===== RENDERIZAR MULTIMEDIA =====
function renderMedia(urls = []) {
    if (!urls.length) return '';
    const count = Math.min(urls.length, 3);
    const items = urls.slice(0, 3).map(url => {
        const type = mediaType(url);
        if (type === 'video') return `
            <div class="media-item">
                <div class="media-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Video adjunto
                </div>
            </div>`;
        if (type === 'audio') return `
            <div class="media-item">
                <div class="media-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    Audio adjunto
                </div>
            </div>`;
        return `
            <div class="media-item">
                <img src="${url}" alt="media" loading="lazy"
                    onerror="this.parentElement.innerHTML='<div class=\\'media-badge\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\\'/></svg> Imagen</div>'">
            </div>`;
    }).join('');
    return `<div class="post-media media-${count}">${items}</div>`;
}

// ===== RENDERIZAR TARJETA DE POST =====
function renderPost(post) {
    const autor = post.autor || {};
    const nombre   = autor.nombreVisible || autor.nombreUsuario || 'Usuario';
    const username = autor.nombreUsuario || 'usuario';
    const color    = avatarColor(username);
    const initials = avatarInitials(nombre);
    const tags  = (post.etiquetas || []).map(t =>
        `<span class="tag-pill" onclick="filterByTag(event,'${t}')">#${t}</span>`
    ).join('');
    const media  = renderMedia(post.urlsMultimedia || []);
    const postId = post._id?.$oid || post._id?.toString() || post._id;

    window._postsData = window._postsData || {};
    window._postsData[postId] = post;

    const currentUser = getCurrentUser();
    const isOwner = normalizeId(post.autorId) === normalizeId(currentUser._id);
    const userLiked = (post.meGusta || []).some(id => normalizeId(id) === normalizeId(currentUser._id));
    const userReposted = (post.reposts || []).some(id => normalizeId(id) === normalizeId(currentUser._id));

    return `
    <article class="post-card" onclick="openPost('${postId}')">
        <div class="post-avatar" style="background:${color}"
             onclick="event.stopPropagation()">${initials}</div>
        <div class="post-body">
            <div class="post-header">
                <span class="post-name">${escHtml(nombre)}</span>
                <span class="post-username">@${escHtml(username)}</span>
                <span class="post-dot">·</span>
                <span class="post-time">${timeAgo(post.fechaCreacion)}</span>
            </div>
            <p class="post-content">${escHtml(post.contenido || '')}</p>
            ${media}
            ${tags ? `<div class="post-tags">${tags}</div>` : ''}
            <div class="post-actions">
                <button class="action-btn replies" onclick="event.stopPropagation(); openPost('${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <span class="action-count">${post.cantidadRespuestas || 0}</span>
                </button>
                <button class="action-btn reposts${userReposted ? ' active' : ''}" onclick="toggleRepost(event, '${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                    <span class="action-count">${post.cantidadReposts || 0}</span>
                </button>
                <button class="action-btn likes${userLiked ? ' active' : ''}" onclick="toggleLike(event, '${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span class="action-count">${post.cantidadMeGusta || 0}</span>
                </button>
                ${isOwner ? `
                <button class="action-btn edit" title="Editar" onclick="event.stopPropagation(); openEditPostById('${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="action-btn delete" title="Eliminar" onclick="event.stopPropagation(); deletePost('${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>` : ''}
            </div>
        </div>
    </article>`;
}

// ===== RENDERIZAR CARD DE RESPUESTA =====
function renderReplyCard(r, postId) {
    const autor = r.autor || {};
    const nombre   = autor.nombreVisible || autor.nombreUsuario || 'Usuario';
    const username = autor.nombreUsuario || 'usuario';
    const color    = avatarColor(username);
    const initials = avatarInitials(nombre);
    const rId      = normalizeId(r._id);
    const currentUser  = getCurrentUser();
    const isOwnReply   = normalizeId(r.autorId) === normalizeId(currentUser._id);

    return `
    <div class="reply-card" id="reply-${rId}">
        <div class="reply-avatar" style="background:${color}">${initials}</div>
        <div class="reply-body">
            <div class="reply-header">
                <span class="reply-name">${escHtml(nombre)}</span>
                <span class="reply-username">@${escHtml(username)}</span>
                ${isOwnReply ? `
                <button class="btn-reply-delete" onclick="deleteComment('${postId}','${rId}')" title="Eliminar">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>` : ''}
            </div>
            <p class="reply-content">${escHtml(r.contenido || '')}</p>
            <div class="reply-likes">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                ${r.cantidadMeGusta || 0}
            </div>
        </div>
    </div>`;
}

// ===== RENDERIZAR MODAL DE POST =====
function renderModal(post) {
    const autor = post.autor || {};
    const nombre   = autor.nombreVisible || autor.nombreUsuario || 'Usuario';
    const username = autor.nombreUsuario || 'usuario';
    const color    = avatarColor(username);
    const initials = avatarInitials(nombre);
    const tags  = (post.etiquetas || []).map(t =>
        `<span class="tag-pill">#${t}</span>`
    ).join('');
    const media  = renderMedia(post.urlsMultimedia || []);
    const postId = normalizeId(post._id);

    const currentUser  = getCurrentUser();
    const userLiked    = (post.meGusta || []).some(id => normalizeId(id) === normalizeId(currentUser._id));
    const userReposted = (post.reposts || []).some(id => normalizeId(id) === normalizeId(currentUser._id));
    const userColor    = avatarColor(currentUser.nombreUsuario || '');
    const userInitials = avatarInitials(currentUser.nombreVisible || currentUser.nombreUsuario || '');

    const repliesHtml = (post.respuestas || []).map(r => renderReplyCard(r, postId)).join('');

    return `
    <div style="padding:16px 20px 0; display:flex; gap:12px;">
        <div class="post-avatar" style="background:${color};width:48px;height:48px;font-size:17px;">${initials}</div>
        <div style="flex:1;">
            <div class="post-header">
                <span class="post-name" style="font-size:16px;">${escHtml(nombre)}</span>
                <span class="post-username">@${escHtml(username)}</span>
            </div>
            <p class="post-content" style="font-size:17px;margin-top:8px;">${escHtml(post.contenido || '')}</p>
            ${media}
            ${tags ? `<div class="post-tags">${tags}</div>` : ''}
            <div style="padding:10px 0;font-size:13px;color:var(--text-muted);border-bottom:1px solid var(--border);">
                ${timeAgo(post.fechaCreacion)} · ${new Date(post.fechaCreacion).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}
            </div>
            <div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;gap:24px;font-size:14px;color:var(--text-muted);">
                <span><strong id="modal-reply-count" style="color:var(--text)">${post.cantidadRespuestas||0}</strong> Respuestas</span>
                <span><strong style="color:var(--text)">${post.cantidadReposts||0}</strong> Reposts</span>
                <span><strong style="color:var(--text)">${post.cantidadMeGusta||0}</strong> Me gusta</span>
            </div>
            <div class="post-actions" style="padding:4px 0;border-bottom:1px solid var(--border);">
                <button class="action-btn replies">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <span class="action-count">${post.cantidadRespuestas||0}</span>
                </button>
                <button class="action-btn reposts${userReposted ? ' active' : ''}" onclick="toggleRepost(event,'${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                    <span class="action-count">${post.cantidadReposts||0}</span>
                </button>
                <button class="action-btn likes${userLiked ? ' active' : ''}" onclick="toggleLike(event,'${postId}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span class="action-count">${post.cantidadMeGusta||0}</span>
                </button>
            </div>
        </div>
    </div>
    <div class="comment-form">
        <div class="post-avatar" style="background:${userColor};width:36px;height:36px;font-size:13px;flex-shrink:0;">${userInitials}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <textarea class="comment-textarea" id="modal-comment-text" placeholder="Escribe una respuesta..."></textarea>
            <div style="display:flex;justify-content:flex-end;">
                <button class="btn-post btn-submit-comment" style="padding:6px 16px;font-size:13px;" onclick="submitComment('${postId}')">Responder</button>
            </div>
        </div>
    </div>
    <div id="modal-replies-section" class="replies-section">
        <div class="replies-title">Respuestas</div>
        ${repliesHtml}
    </div>`;
}

// ===== RENDERIZAR CARD DE USUARIO =====
function renderUserCard(u) {
    const color    = avatarColor(u.nombreUsuario || '');
    const initials = avatarInitials(u.nombreVisible || u.nombreUsuario || '');
    const userId   = u._id?.$oid || u._id?.toString() || u._id;

    window._usersData = window._usersData || {};
    window._usersData[userId] = u;

    const currentUser  = getCurrentUser();
    const isCurrentUser = String(userId) === String(currentUser._id);

    return `
    <div class="user-card">
        <div class="user-card-avatar" style="background:${color}">${initials}</div>
        <div class="user-card-info">
            <div class="user-card-name">
                ${escHtml(u.nombreVisible || u.nombreUsuario || '')}
                ${isCurrentUser ? '<span style="font-size:11px;color:var(--accent);font-weight:600;margin-left:6px;">Tú</span>' : ''}
            </div>
            <div class="user-card-username">@${escHtml(u.nombreUsuario || '')}</div>
            ${u.biografia ? `<div class="user-card-bio">${escHtml(u.biografia)}</div>` : ''}
            <div class="user-card-stats">
                <span><strong>${u.estadisticas?.cantidadPosts ?? 0}</strong> posts</span>
                <span><strong>${u.estadisticas?.cantidadSeguidores ?? 0}</strong> seguidores</span>
                <span><strong>${(u.siguiendo || []).length}</strong> siguiendo</span>
            </div>
        </div>
        ${isCurrentUser ? `
        <div class="user-card-actions">
            <button class="action-btn edit" title="Editar perfil" onclick="openEditUserById('${userId}')">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
        </div>` : ''}
    </div>`;
}

// ===== FETCH CON MANEJO DE ERRORES =====
async function apiFetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ===== CARGAR POSTS =====
async function loadPosts(reset = false) {
    if (reset) { state.page = 1; state.posts = []; }

    const params = new URLSearchParams({ page: state.page });
    if (state.activeTag)   params.set('etiqueta', state.activeTag);
    if (state.searchQuery) params.set('buscar', state.searchQuery);

    try {
        const data = await apiFetch(`/api/publicaciones?${params}`);
        state.posts = reset ? data.posts : [...state.posts, ...data.posts];
        state.total = data.total;

        const container = document.getElementById('posts-container');
        const filterBar = document.getElementById('active-filter-bar');

        if (state.activeTag && reset) {
            if (!filterBar) {
                const bar = document.createElement('div');
                bar.id = 'active-filter-bar';
                bar.className = 'active-filter';
                bar.innerHTML = `Filtrando por <strong>#${state.activeTag}</strong>
                    <span class="filter-clear" onclick="clearFilter()">✕ Quitar filtro</span>`;
                container.before(bar);
            }
        } else if (filterBar) filterBar.remove();

        if (reset) {
            container.innerHTML = state.posts.length
                ? state.posts.map(renderPost).join('')
                : `<div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <h3>Sin publicaciones</h3>
                    <p>No se encontraron resultados.</p>
                   </div>`;
        } else {
            container.insertAdjacentHTML('beforeend', state.posts.slice(-data.posts.length).map(renderPost).join(''));
        }

        document.getElementById('load-more-wrapper').style.display =
            state.posts.length < state.total ? 'block' : 'none';
    } catch (e) {
        document.getElementById('posts-container').innerHTML =
            `<div class="empty-state"><h3>Error al cargar</h3><p>${e.message}</p></div>`;
    }
}

// ===== CARGAR USUARIOS =====
async function loadUsuarios() {
    const container = document.getElementById('usuarios-container');
    container.innerHTML = '<div class="skeleton-loader"><div class="skeleton-post"></div><div class="skeleton-post"></div></div>';
    try {
        const usuarios = await apiFetch('/api/usuarios');
        container.innerHTML = `<div class="user-grid">${usuarios.map(renderUserCard).join('')}</div>`;
    } catch (e) {
        container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${e.message}</p></div>`;
    }
}

// ===== CARGAR TRENDING + SUGERENCIAS =====
async function loadSidebar() {
    try {
        const [stats, usuarios] = await Promise.all([
            apiFetch('/api/stats'),
            apiFetch('/api/usuarios')
        ]);

        document.getElementById('stat-posts').textContent = stats.totalPosts;
        document.getElementById('stat-users').textContent = stats.totalUsuarios;

        const trendingEl = document.getElementById('trending-container');
        trendingEl.innerHTML = stats.trending.length
            ? stats.trending.map(t => `
                <div class="trending-item" onclick="filterByTag(null,'${t._id}')">
                    <span class="trending-tag">#${escHtml(t._id)}</span>
                    <span class="trending-count">${t.count} posts</span>
                </div>`).join('')
            : '<p style="color:var(--text-muted);font-size:13px;">Sin datos</p>';

        const suggestEl = document.getElementById('suggest-container');
        const currentUser = getCurrentUser();
        suggestEl.innerHTML = usuarios.slice(0, 4).map(u => {
            const color    = avatarColor(u.nombreUsuario || '');
            const initials = avatarInitials(u.nombreVisible || '');
            return `
            <div class="suggest-item">
                <div class="suggest-avatar" style="background:${color}">${initials}</div>
                <div class="suggest-info">
                    <div class="suggest-name">${escHtml(u.nombreVisible || u.nombreUsuario || '')}</div>
                    <div class="suggest-bio">${escHtml(u.biografia || '')}</div>
                </div>
            </div>`;
        }).join('');

        const etiquetasEl = document.getElementById('etiquetas-container');
        etiquetasEl.innerHTML = `<div class="tags-grid">${stats.trending.map(t => `
            <div class="tag-card" onclick="filterByTag(null,'${t._id}')">
                <div class="tag-card-name">#${escHtml(t._id)}</div>
                <div class="tag-card-count">${t.count} publicaciones</div>
            </div>`).join('')}</div>`;
    } catch(e) {
        console.error('Error cargando sidebar:', e);
    }
}

// ===== FILTRAR POR TAG =====
function filterByTag(e, tag) {
    if (e) e.stopPropagation();
    state.activeTag = tag;
    state.searchQuery = '';
    document.getElementById('search-input').value = '';
    switchView('feed');
    loadPosts(true);
}

function clearFilter() {
    state.activeTag = null;
    loadPosts(true);
}

// ===== ABRIR MODAL DE POST =====
async function openPost(postId) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Cargando...</div>';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    try {
        const post = await apiFetch(`/api/publicaciones/${postId}`);
        content.innerHTML = renderModal(post);
    } catch (e) {
        content.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${e.message}</p></div>`;
    }
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.style.overflow = '';
}

// ===== CAMBIAR VISTA =====
function switchView(view) {
    state.currentView = view;
    ['feed', 'usuarios', 'etiquetas', 'perfil'].forEach(v => {
        document.getElementById(`view-${v}`).style.display = v === view ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === view);
    });
    const titles = { feed: 'Inicio', usuarios: 'Usuarios', etiquetas: 'Etiquetas', perfil: 'Mi perfil' };
    document.getElementById('feed-title').textContent = titles[view];
    if (view === 'usuarios') loadUsuarios();
    if (view === 'perfil')   loadPerfil();
}

// ===== ESCAPE HTML =====
function escHtml(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

// ===== NORMALIZAR ID (maneja string y {$oid:...}) =====
function normalizeId(id) {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (id.$oid) return id.$oid;
    return String(id);
}

// ===== COMPOSE BOX =====
function initComposeBox() {
    const user     = getCurrentUser();
    const avatar   = document.getElementById('compose-avatar');
    const userEl   = document.getElementById('compose-username');
    avatar.style.background = avatarColor(user.nombreUsuario || '');
    avatar.style.color = '#fff';
    avatar.textContent = avatarInitials(user.nombreVisible || user.nombreUsuario || '');
    userEl.textContent = user.nombreVisible
        ? `${user.nombreVisible} · @${user.nombreUsuario}`
        : `@${user.nombreUsuario}`;
}

function initSidebarUser() {
    const user = getCurrentUser();
    document.getElementById('chip-avatar').style.background = avatarColor(user.nombreUsuario || '');
    document.getElementById('chip-avatar').style.color = '#fff';
    document.getElementById('chip-avatar').textContent = avatarInitials(user.nombreVisible || user.nombreUsuario || '');
    document.getElementById('chip-nombre').textContent   = user.nombreVisible || user.nombreUsuario || '—';
    document.getElementById('chip-username').textContent = '@' + (user.nombreUsuario || '—');
}

async function submitPost() {
    const user     = getCurrentUser();
    const contenido = document.getElementById('compose-text').value.trim();
    const tagsRaw  = document.getElementById('compose-tags').value.trim();
    const etiquetas = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!contenido) return alert('El contenido no puede estar vacío');

    const btn = document.getElementById('btn-submit-post');
    btn.disabled = true;
    try {
        const res = await fetch('/api/publicaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autorId: user._id, contenido, etiquetas })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        document.getElementById('compose-text').value = '';
        document.getElementById('compose-tags').value = '';
        loadPosts(true);
    } catch(e) {
        alert('Error al publicar: ' + e.message);
    } finally {
        btn.disabled = false;
    }
}

// ===== CRUD PUBLICACIONES =====
function openEditPostById(postId) {
    const post = (window._postsData || {})[postId];
    if (!post) return;
    const content = document.getElementById('modal-content');
    document.getElementById('modal-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    content.innerHTML = `
    <div class="form-modal">
        <h3>Editar publicación</h3>
        <div class="form-group">
            <label class="form-label">Contenido</label>
            <textarea class="form-textarea" id="edit-post-text">${escHtml(post.contenido || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Etiquetas (separadas por coma)</label>
            <input class="form-input" id="edit-post-tags" value="${escHtml((post.etiquetas || []).join(', '))}">
        </div>
        <div class="form-actions">
            <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
            <button class="btn-post" onclick="submitEditPost('${postId}')">Guardar cambios</button>
        </div>
    </div>`;
}

async function submitEditPost(postId) {
    const contenido = document.getElementById('edit-post-text').value.trim();
    const tagsRaw   = document.getElementById('edit-post-tags').value.trim();
    const etiquetas = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (!contenido) return alert('El contenido no puede estar vacío');
    try {
        const res = await fetch(`/api/publicaciones/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido, etiquetas })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        closeModal();
        loadPosts(true);
    } catch(e) {
        alert('Error al editar: ' + e.message);
    }
}

async function deletePost(postId) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
        const res = await fetch(`/api/publicaciones/${postId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).error);
        loadPosts(true);
    } catch(e) {
        alert('Error al eliminar: ' + e.message);
    }
}

// ===== CRUD USUARIOS =====

function openEditUserById(userId) {
    const u = (window._usersData || {})[userId];
    if (!u) return;
    const content = document.getElementById('modal-content');
    document.getElementById('modal-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    content.innerHTML = `
    <div class="form-modal">
        <h3>Editar mi perfil</h3>
        <div class="form-group">
            <label class="form-label">Nombre visible</label>
            <input class="form-input" id="edit-user-nombre" value="${escHtml(u.nombreVisible || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <input class="form-input" type="email" id="edit-user-correo" value="${escHtml(u.correo || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Biografía</label>
            <textarea class="form-textarea" id="edit-user-bio">${escHtml(u.biografia || '')}</textarea>
        </div>
        <div class="form-actions">
            <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
            <button class="btn-post" onclick="submitEditUser('${userId}')">Guardar cambios</button>
        </div>
    </div>`;
}

async function submitEditUser(userId) {
    const nombreVisible = document.getElementById('edit-user-nombre').value.trim();
    const correo        = document.getElementById('edit-user-correo').value.trim();
    const biografia     = document.getElementById('edit-user-bio').value.trim();
    try {
        const res = await fetch(`/api/usuarios/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreVisible, correo, biografia })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        // Actualizar sesión local si es el usuario activo
        const current = getCurrentUser();
        if (String(userId) === String(current._id)) {
            current.nombreVisible = nombreVisible;
            current.correo = correo;
            current.biografia = biografia;
            localStorage.setItem('currentUser', JSON.stringify(current));
            initComposeBox();
            initSidebarUser();
        }
        closeModal();
        if (state.currentView === 'perfil') loadPerfil();
        else loadUsuarios();
    } catch(e) {
        alert('Error al editar: ' + e.message);
    }
}

// ===== VISTA PERFIL =====
function renderPerfilHeader(user) {
    const color    = avatarColor(user.nombreUsuario || '');
    const initials = avatarInitials(user.nombreVisible || user.nombreUsuario || '');
    const userId   = user._id?.$oid || user._id?.toString() || user._id;
    window._usersData = window._usersData || {};
    window._usersData[userId] = user;
    return `
    <div class="perfil-header">
        <div class="perfil-avatar" style="background:${color}">${initials}</div>
        <div class="perfil-info">
            <div class="perfil-name">${escHtml(user.nombreVisible || user.nombreUsuario || '')}</div>
            <div class="perfil-username">@${escHtml(user.nombreUsuario || '')}</div>
            ${user.correo ? `<div class="perfil-correo">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;opacity:.6"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                ${escHtml(user.correo)}
            </div>` : ''}
            <p class="perfil-bio">${user.biografia ? escHtml(user.biografia) : '<span style="color:var(--text-muted)">Sin biografía</span>'}</p>
            <div class="perfil-stats">
                <span><strong>${user.estadisticas?.cantidadPosts ?? 0}</strong> posts</span>
                <span><strong>${user.estadisticas?.cantidadSeguidores ?? 0}</strong> seguidores</span>
                <span><strong>${(user.siguiendo || []).length}</strong> siguiendo</span>
            </div>
        </div>
        <button class="btn-new" onclick="openEditUserById('${userId}')">Editar perfil</button>
    </div>`;
}

// ===== RENDERIZAR PANEL DE ANALYTICS =====
function renderAnalytics(data) {
    if (!data) return '';
    const t = data.totales;

    // ── Barra visual para actividad semanal ──
    const maxPosts = Math.max(1, ...data.actividadSemanal.map(d => d.posts));
    const barras = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(dia => {
        const d = data.actividadSemanal.find(x => x.dia === dia);
        const h = d ? Math.round((d.posts / maxPosts) * 100) : 0;
        return `
        <div class="analytics-bar-col">
            <div class="analytics-bar-wrap">
                <div class="analytics-bar" style="height:${h}%" title="${d ? d.posts + ' post(s)' : '0 posts'}"></div>
            </div>
            <span class="analytics-bar-label">${dia}</span>
        </div>`;
    }).join('');

    // ── Top etiquetas ──
    const etiquetasHtml = data.topEtiquetas.length
        ? data.topEtiquetas.map(e => `
            <div class="analytics-tag-row">
                <span class="tag-pill" onclick="filterByTag(event,'${e.etiqueta}')">#${escHtml(e.etiqueta)}</span>
                <span class="analytics-tag-count">${e.usos} uso${e.usos > 1 ? 's' : ''}</span>
            </div>`).join('')
        : '<p style="color:var(--text-muted);font-size:13px;">Sin etiquetas aún</p>';

    // ── Post top ──
    const topPostHtml = data.topPost
        ? `<div class="analytics-top-post">
            <div class="analytics-top-post-text">${escHtml((data.topPost.contenido || '').slice(0, 120))}${data.topPost.contenido?.length > 120 ? '…' : ''}</div>
            <div class="analytics-top-post-stats">
                <span title="Me gusta">♥ ${data.topPost.cantidadMeGusta}</span>
                <span title="Reposts">⇄ ${data.topPost.cantidadReposts}</span>
                <span title="Respuestas">💬 ${data.topPost.cantidadRespuestas}</span>
                <span class="analytics-score">Score: <strong>${data.topPost.engagementScore}</strong></span>
            </div>
           </div>`
        : '<p style="color:var(--text-muted);font-size:13px;">Sin publicaciones aún</p>';

    return `
    <div class="analytics-panel">
        <div class="analytics-title">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            Analytics
        </div>

        <!-- Métricas globales -->
        <div class="analytics-cards">
            <div class="analytics-card">
                <div class="analytics-card-num">${t.totalMeGusta}</div>
                <div class="analytics-card-label">Likes recibidos</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-card-num">${t.totalReposts}</div>
                <div class="analytics-card-label">Reposts</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-card-num">${t.totalRespuestas}</div>
                <div class="analytics-card-label">Respuestas</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-card-num">${(t.promedioLikes || 0).toFixed(1)}</div>
                <div class="analytics-card-label">Avg likes/post</div>
            </div>
        </div>

        <!-- Actividad semanal -->
        <div class="analytics-section-title">Actividad semanal</div>
        <div class="analytics-bars">${barras}</div>

        <!-- Post más popular + etiquetas -->
        <div class="analytics-bottom">
            <div class="analytics-col">
                <div class="analytics-section-title">Post más popular</div>
                ${topPostHtml}
            </div>
            <div class="analytics-col">
                <div class="analytics-section-title">Tus etiquetas top</div>
                ${etiquetasHtml}
            </div>
        </div>
    </div>`;
}

async function loadPerfil() {
    const container = document.getElementById('perfil-container');
    container.innerHTML = '<div class="skeleton-loader"><div class="skeleton-post"></div><div class="skeleton-post"></div><div class="skeleton-post"></div></div>';

    const user = getCurrentUser();
    if (!user._id) { logout(); return; }

    let userData, postsData, analyticsData;
    try {
        [userData, postsData, analyticsData] = await Promise.all([
            apiFetch(`/api/usuarios/${user._id}`),
            apiFetch(`/api/publicaciones?autorId=${user._id}`),
            apiFetch(`/api/usuarios/${user._id}/analytics`),
        ]);
    } catch(e) {
        if (e.message.includes('404')) {
            container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <h3>Sesión expirada</h3>
                <p>Tu sesión ya no es válida. Vuelve a iniciar sesión.</p>
                <button class="btn-post" onclick="logout()" style="margin-top:16px;">Cerrar sesión</button>
            </div>`;
            return;
        }
        container.innerHTML = `
        <div class="empty-state">
            <h3>Sin conexión</h3>
            <p>No se pudo conectar con el servidor. ¿Está corriendo <code>node server.js</code>?</p>
        </div>`;
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify({ ...user, ...userData }));
    initSidebarUser();
    initComposeBox();

    const postsHtml = (postsData.posts || []).length
        ? postsData.posts.map(renderPost).join('')
        : `<div class="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <h3>Sin publicaciones</h3>
            <p>Todavía no has publicado nada.</p>
           </div>`;

    container.innerHTML =
        renderPerfilHeader(userData) +
        renderAnalytics(analyticsData) +
        `<div class="perfil-posts-title" style="margin-top:8px;">Mis publicaciones</div>` +
        postsHtml;
}

// ===== TOGGLE LIKE =====
async function toggleLike(e, postId) {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user._id) return;

    const btn = e.target.closest('.action-btn');
    if (!btn || btn.disabled) return;
    const countEl = btn.querySelector('.action-count');
    const wasActive = btn.classList.contains('active');
    const prevCount = parseInt(countEl.textContent) || 0;

    btn.classList.toggle('active');
    countEl.textContent = prevCount + (wasActive ? -1 : 1);
    btn.disabled = true;

    try {
        const res = await fetch(`/api/publicaciones/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id })
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        btn.classList.toggle('active', data.liked);
        countEl.textContent = data.cantidadMeGusta;

        // Sincronizar el contador en el resumen del modal si está abierto
        const statsLike = document.querySelector('#modal-content strong:last-of-type');
        if (statsLike) statsLike.textContent = data.cantidadMeGusta;
    } catch {
        btn.classList.toggle('active', wasActive);
        countEl.textContent = prevCount;
    } finally {
        btn.disabled = false;
    }
}

// ===== TOGGLE REPOST =====
async function toggleRepost(e, postId) {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user._id) return;

    const btn = e.target.closest('.action-btn');
    if (!btn || btn.disabled) return;
    const countEl = btn.querySelector('.action-count');
    const wasActive = btn.classList.contains('active');
    const prevCount = parseInt(countEl.textContent) || 0;

    btn.classList.toggle('active');
    countEl.textContent = prevCount + (wasActive ? -1 : 1);
    btn.disabled = true;

    try {
        const res = await fetch(`/api/publicaciones/${postId}/repost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id })
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        btn.classList.toggle('active', data.reposted);
        countEl.textContent = data.cantidadReposts;
    } catch {
        btn.classList.toggle('active', wasActive);
        countEl.textContent = prevCount;
    } finally {
        btn.disabled = false;
    }
}

// ===== ENVIAR COMENTARIO =====
async function submitComment(postId) {
    const user     = getCurrentUser();
    const textarea = document.getElementById('modal-comment-text');
    const contenido = textarea?.value?.trim();
    if (!contenido) return;

    const btn = document.querySelector('.btn-submit-comment');
    if (btn) btn.disabled = true;

    try {
        const res = await fetch(`/api/publicaciones/${postId}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autorId: user._id, contenido })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const newComment = await res.json();

        newComment.autor = {
            nombreUsuario: user.nombreUsuario,
            nombreVisible: user.nombreVisible
        };

        const section = document.getElementById('modal-replies-section');
        if (section) {
            section.insertAdjacentHTML('beforeend', renderReplyCard(newComment, postId));
        }

        const countEl = document.getElementById('modal-reply-count');
        if (countEl) countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;

        textarea.value = '';
    } catch(e) {
        alert('Error al comentar: ' + e.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ===== ELIMINAR COMENTARIO =====
async function deleteComment(postId, comentarioId) {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
        const res = await fetch(`/api/publicaciones/${postId}/comentarios/${comentarioId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error((await res.json()).error);

        document.getElementById(`reply-${comentarioId}`)?.remove();

        const countEl = document.getElementById('modal-reply-count');
        if (countEl) countEl.textContent = Math.max(0, (parseInt(countEl.textContent) || 0) - 1);
    } catch(e) {
        alert('Error al eliminar: ' + e.message);
    }
}

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user._id) {
        window.location.replace('login.html');
        return;
    }

    initSidebarUser();
    initComposeBox();
    loadPosts(true);
    loadSidebar();

    // Navegación
    document.querySelectorAll('.nav-item').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            switchView(el.dataset.view);
        });
    });

    // Buscar con debounce
    let searchTimer;
    document.getElementById('search-input').addEventListener('input', e => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.searchQuery = e.target.value.trim();
            state.activeTag = null;
            loadPosts(true);
        }, 400);
    });

    // Cargar más
    document.getElementById('btn-load-more').addEventListener('click', () => {
        state.page++;
        loadPosts(false);
    });

    // Cerrar modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
});
