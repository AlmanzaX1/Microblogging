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
    if (diff < 60)   return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ===== DETECCIÓN DE TIPO DE MEDIA =====
function mediaType(url = '') {
    if (url.match(/\.(mp4|webm|mov)$/i)) return 'video';
    if (url.match(/\.(mp3|ogg|wav)$/i)) return 'audio';
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
    const nombre = autor.nombreVisible || autor.nombreUsuario || 'Usuario';
    const username = autor.nombreUsuario || 'usuario';
    const color = avatarColor(username);
    const initials = avatarInitials(nombre);
    const tags = (post.etiquetas || []).map(t =>
        `<span class="tag-pill" onclick="filterByTag(event,'${t}')">#${t}</span>`
    ).join('');
    const media = renderMedia(post.urlsMultimedia || []);
    const postId = post._id?.$oid || post._id?.toString() || post._id;

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
                <button class="action-btn replies" onclick="event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    ${post.cantidadRespuestas || 0}
                </button>
                <button class="action-btn reposts" onclick="event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                    ${post.cantidadReposts || 0}
                </button>
                <button class="action-btn likes" onclick="event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    ${post.cantidadMeGusta || 0}
                </button>
            </div>
        </div>
    </article>`;
}

// ===== RENDERIZAR MODAL DE POST =====
function renderModal(post) {
    const autor = post.autor || {};
    const nombre = autor.nombreVisible || autor.nombreUsuario || 'Usuario';
    const username = autor.nombreUsuario || 'usuario';
    const color = avatarColor(username);
    const initials = avatarInitials(nombre);
    const tags = (post.etiquetas || []).map(t =>
        `<span class="tag-pill">#${t}</span>`
    ).join('');
    const media = renderMedia(post.urlsMultimedia || []);

    const replies = (post.respuestas || []).map(r => {
        const rColor = avatarColor(r.autorId?.toString() || '');
        const rInit = String.fromCharCode(65 + (Math.abs(r.autorId?.toString()?.charCodeAt(0) || 65) % 26));
        return `
        <div class="reply-card">
            <div class="reply-avatar" style="background:${rColor}">${rInit}</div>
            <div class="reply-body">
                <div class="reply-header">
                    <span class="reply-name">Usuario</span>
                    <span class="reply-username">@respuesta</span>
                </div>
                <p class="reply-content">${escHtml(r.contenido || '')}</p>
                ${(r.urlsMultimedia || []).length ? renderMedia(r.urlsMultimedia) : ''}
                <div class="reply-likes">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    ${r.cantidadMeGusta || 0}
                </div>
            </div>
        </div>`;
    }).join('');

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
            <div style="padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin:12px 0;display:flex;gap:24px;font-size:14px;color:var(--text-muted);">
                <span><strong style="color:var(--text)">${post.cantidadMeGusta||0}</strong> Me gusta</span>
                <span><strong style="color:var(--text)">${post.cantidadReposts||0}</strong> Reposts</span>
                <span><strong style="color:var(--text)">${post.cantidadRespuestas||0}</strong> Respuestas</span>
            </div>
            <div style="padding-bottom:8px;font-size:13px;color:var(--text-muted);">
                ${timeAgo(post.fechaCreacion)} · ${new Date(post.fechaCreacion).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}
            </div>
        </div>
    </div>
    ${replies ? `
    <div class="replies-section">
        <div class="replies-title">Respuestas</div>
        ${replies}
    </div>` : ''}`;
}

// ===== RENDERIZAR CARD DE USUARIO =====
function renderUserCard(u) {
    const color = avatarColor(u.nombreUsuario || '');
    const initials = avatarInitials(u.nombreVisible || u.nombreUsuario || '');
    return `
    <div class="user-card">
        <div class="user-card-avatar" style="background:${color}">${initials}</div>
        <div class="user-card-info">
            <div class="user-card-name">${escHtml(u.nombreVisible || u.nombreUsuario || '')}</div>
            <div class="user-card-username">@${escHtml(u.nombreUsuario || '')}</div>
            ${u.biografia ? `<div class="user-card-bio">${escHtml(u.biografia)}</div>` : ''}
            <div class="user-card-stats">
                <span><strong>${u.estadisticas?.cantidadPosts ?? 0}</strong> posts</span>
                <span><strong>${u.estadisticas?.cantidadSeguidores ?? 0}</strong> seguidores</span>
                <span><strong>${(u.siguiendo || []).length}</strong> siguiendo</span>
            </div>
        </div>
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
    if (state.activeTag)    params.set('etiqueta', state.activeTag);
    if (state.searchQuery)  params.set('buscar', state.searchQuery);

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

        const loadMoreWrapper = document.getElementById('load-more-wrapper');
        loadMoreWrapper.style.display = state.posts.length < state.total ? 'block' : 'none';
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

        // Stats
        document.getElementById('stat-posts').textContent = stats.totalPosts;
        document.getElementById('stat-users').textContent = stats.totalUsuarios;

        // Trending tags
        const trendingEl = document.getElementById('trending-container');
        trendingEl.innerHTML = stats.trending.length
            ? stats.trending.map(t => `
                <div class="trending-item" onclick="filterByTag(null,'${t._id}')">
                    <span class="trending-tag">#${escHtml(t._id)}</span>
                    <span class="trending-count">${t.count} posts</span>
                </div>`).join('')
            : '<p style="color:var(--text-muted);font-size:13px;">Sin datos</p>';

        // Sugerencias (top 4 usuarios)
        const suggestEl = document.getElementById('suggest-container');
        suggestEl.innerHTML = usuarios.slice(0, 4).map(u => {
            const color = avatarColor(u.nombreUsuario || '');
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

        // Vista de etiquetas
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
    const views = ['feed', 'usuarios', 'etiquetas'];
    views.forEach(v => {
        document.getElementById(`view-${v}`).style.display = v === view ? 'block' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === view);
    });
    const titles = { feed: 'Inicio', usuarios: 'Usuarios', etiquetas: 'Etiquetas' };
    document.getElementById('feed-title').textContent = titles[view];
    if (view === 'usuarios') loadUsuarios();
}

// ===== ESCAPE HTML =====
function escHtml(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', () => {
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
