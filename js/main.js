// Carrusel de imágenes con fade
(function(){
    function initCarousel(){
        const track = document.querySelector('.carousel-track');
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const indicators = Array.from(document.querySelectorAll('.indicator'));
        let currentIndex = 0;
        let autoPlayInterval;

        if(!track || slides.length === 0) return;

        slides.forEach((slide, idx) => {
            slide.style.position = 'absolute';
            slide.style.opacity = idx === 0 ? '1' : '0';
            slide.style.transition = 'opacity 0.8s ease-in-out';
        });

        function updateCarousel(){
            slides.forEach((slide, idx) => {
                slide.style.opacity = idx === currentIndex ? '1' : '0';
            });
            indicators.forEach((indicator, idx) => {
                indicator.classList.toggle('active', idx === currentIndex);
            });
        }

        function nextSlide(){
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
            resetAutoPlay();
        }

        function prevSlide(){
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
            resetAutoPlay();
        }

        function autoPlay(){
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoPlay(){
            clearInterval(autoPlayInterval);
            autoPlay();
        }

        prevBtn?.addEventListener('click', prevSlide);
        nextBtn?.addEventListener('click', nextSlide);
        
        indicators.forEach((indicator, idx) => {
            indicator.addEventListener('click', () => {
                currentIndex = idx;
                updateCarousel();
                resetAutoPlay();
            });
        });

        updateCarousel();
        autoPlay();
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
})();

// Modo oscuro con transición suave, carrito y subastas de ejemplo
(function(){
    const body = document.body;
    const btn = document.getElementById('darkModeBtn');
    const cartBtn = document.getElementById('cartBtn');

    function applyVars(vars){
        const root = document.documentElement;
        Object.keys(vars).forEach(k=> root.style.setProperty(k, vars[k]));
    }

    function setTheme(dark){
        if(dark) body.classList.add('darkmode'); else body.classList.remove('darkmode');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        btn.classList.toggle('active', dark);
        btn.setAttribute('aria-pressed', dark);
        btn.textContent = dark ? '☀️' : '🌙';

        // Ajustes finos de variables para mejor contraste
        if(dark){
            applyVars({
                '--bg':'#23232b','--panel':'#2d2d38','--text':'#e0e0e0','--card':'#23232b','--border':'#3a2352','--search-bg':'#23232b','--accent':'#b39ddb'
            });
        } else {
            applyVars({
                '--bg':'#f7f5ed','--panel':'#f3f1e7','--text':'#181818','--card':'#ffffff','--border':'rgba(0,0,0,0.04)','--search-bg':'#ffffff','--accent':'#3a2352'
            });
        }
    }

    // Inicializar tema
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored ? stored === 'dark' : prefersDark);

    btn.addEventListener('click', ()=> setTheme(!document.body.classList.contains('darkmode')));

    // ---------------- Cart (localStorage) ----------------
    const CART_KEY = 'shop_cart_v1';
    function loadCart(){
        try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){return []}
    }
    function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    function cartCount(){ return loadCart().reduce((s,i)=>s+(i.qty||1),0); }
    function findItem(cart,id){ return cart.find(c=>c.id===id); }

    function addToCart(item){
        const cart = loadCart();
        const existing = findItem(cart,item.id);
        if(existing){ existing.qty = (existing.qty||1) + (item.qty||1); }
        else cart.push(Object.assign({qty: item.qty||1}, item));
        saveCart(cart);
        updateCartCount();
        renderCartPanel();
    }

    function removeFromCart(id){
        let cart = loadCart().filter(i=>i.id!==id);
        saveCart(cart); updateCartCount(); renderCartPanel();
    }

    function changeQty(id, delta){
        const cart = loadCart();
        const it = findItem(cart,id); if(!it) return;
        it.qty = Math.max(1, (it.qty||1) + delta);
        saveCart(cart); updateCartCount(); renderCartPanel();
    }

    function updateCartCount(){
        const el = document.getElementById('cartCount'); if(!el) return;
        el.textContent = String(cartCount());
    }

    // Exponer API para product.js
    window.cartAPI = { add: addToCart, remove: removeFromCart, changeQty, get: loadCart };

    // Crear panel del carrito (o reusar)
    function renderCartPanel(){
        let panel = document.querySelector('.cart-panel');
        if(!panel){ panel = document.createElement('div'); panel.className='cart-panel'; document.body.appendChild(panel); }
        const cart = loadCart();
        if(cart.length===0){ panel.innerHTML = '<h3>Carrito</h3><div class="cart-empty">No hay artículos en el carrito.</div>'; return; }
        let html = '<h3>Carrito</h3>';
        cart.forEach(it=>{
            html += `<div class="cart-item"><img src="${it.img}" alt="${it.title}"><div style="flex:1"><div style="font-weight:700">${it.title}</div><div style="color:var(--muted)">€${(it.price||0).toFixed(2)}</div></div><div class="cart-actions"><button data-id="${it.id}" class="cart-dec">−</button><div style="padding:0 .6rem">${it.qty}</div><button data-id="${it.id}" class="cart-inc">+</button><button data-id="${it.id}" class="cart-remove" style="margin-left:.4rem">✕</button></div></div>`;
        });
        const total = cart.reduce((s,i)=>s + (i.price||0)*(i.qty||1),0);
        html += `<div style="padding:.6rem;display:flex;justify-content:space-between;align-items:center"><strong>Total</strong><strong>€${total.toFixed(2)}</strong></div>`;
        html += `<div style="padding:.4rem;display:flex;gap:.5rem"><button id="checkoutBtn" class="btn">Comprar ahora</button><button id="clearCart" class="btn">Vaciar</button></div>`;
        panel.innerHTML = html;
    }

    // Abrir/ocultar panel
    if(cartBtn){ cartBtn.addEventListener('click', ()=>{
        const panel = document.querySelector('.cart-panel');
        if(panel && panel.style.display !== 'none'){ panel.remove(); }
        else renderCartPanel();
    }); }

    // Delegación para botones del panel
    document.addEventListener('click',(e)=>{
        const dec = e.target.closest('.cart-dec'); if(dec){ changeQty(dec.dataset.id,-1); return; }
        const inc = e.target.closest('.cart-inc'); if(inc){ changeQty(inc.dataset.id,1); return; }
        const rem = e.target.closest('.cart-remove'); if(rem){ removeFromCart(rem.dataset.id); return; }
        const clear = e.target.closest('#clearCart'); if(clear){ localStorage.removeItem(CART_KEY); updateCartCount(); const panel = document.querySelector('.cart-panel'); if(panel) panel.remove(); return; }
        const checkout = e.target.closest('#checkoutBtn'); if(checkout){ alert('Checkout demo — integrar pasarela de pago'); localStorage.removeItem(CART_KEY); updateCartCount(); const panel = document.querySelector('.cart-panel'); if(panel) panel.remove(); return; }
    });

    // Iniciar contador de carrito
    updateCartCount();

    // ---------------- Subastas con localStorage ----------------
    const AUCTIONS_KEY = 'shop_auctions_v1';
    const BIDS_KEY = 'shop_bids_v1';
    
    const mockUsers = [
        {id:1, name:'Juan M.', avatar:'👨‍💼'},
        {id:2, name:'María L.', avatar:'👩‍💼'},
        {id:3, name:'Carlos R.', avatar:'👨‍💻'},
        {id:4, name:'Ana P.', avatar:'👩‍💻'},
        {id:5, name:'Diego H.', avatar:'👨‍🎨'}
    ];

    function loadAuctions(){
        try{
            const saved = localStorage.getItem(AUCTIONS_KEY);
            return saved ? JSON.parse(saved) : [
                {id:'air-zone-1', title:'Air Zone 1 (Limited)', img:'images/bball-shoe.svg', currentBid:129.99, ends: Date.now()+1000*60*60*6},
                {id:'raptor-gloves', title:'Guantes Raptor (Signed)', img:'images/boxing-gloves.svg', currentBid:199.00, ends: Date.now()+1000*60*60*24},
                {id:'speedkick-fg', title:'SpeedKick FG (Rare)', img:'images/football-boot.svg', currentBid:249.50, ends: Date.now()+1000*60*45}
            ];
        }catch(e){
            return [
                {id:'air-zone-1', title:'Air Zone 1 (Limited)', img:'images/bball-shoe.svg', currentBid:129.99, ends: Date.now()+1000*60*60*6},
                {id:'raptor-gloves', title:'Guantes Raptor (Signed)', img:'images/boxing-gloves.svg', currentBid:199.00, ends: Date.now()+1000*60*60*24},
                {id:'speedkick-fg', title:'SpeedKick FG (Rare)', img:'images/football-boot.svg', currentBid:249.50, ends: Date.now()+1000*60*45}
            ];
        }
    }

    function saveAuctions(auctions){
        localStorage.setItem(AUCTIONS_KEY, JSON.stringify(auctions));
    }

    function loadBids(){
        try{
            return JSON.parse(localStorage.getItem(BIDS_KEY)) || {};
        }catch(e){
            return {};
        }
    }

    function saveBids(bids){
        localStorage.setItem(BIDS_KEY, JSON.stringify(bids));
    }

    let auctions = loadAuctions();
    let allBids = loadBids();

    const auctionGrid = document.getElementById('auctionGrid');

    function formatCurrency(v){ return '€' + v.toFixed(2); }

    function renderBidHistory(auctionId){
        const bids = allBids[auctionId] || [];
        if(bids.length === 0) return '<div style="font-size:0.9rem;color:var(--text);opacity:0.7;">Sin pujas aún</div>';
        return bids.slice(-3).reverse().map((bid,i) => {
            const user = mockUsers.find(u=>u.id===bid.userId) || {name:'Usuario',avatar:'👤'};
            return `<div style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;padding:0.3rem 0;border-bottom:1px solid var(--border);">
                <span>${user.avatar}</span>
                <span style="flex:1;color:var(--text);">${user.name}</span>
                <strong>${formatCurrency(bid.amount)}</strong>
            </div>`;
        }).join('');
    }

    function renderAuctions(){
        if(!auctionGrid) return;
        auctionGrid.innerHTML = '';
        auctions.forEach(a => {
            const bidHistory = renderBidHistory(a.id);
            const card = document.createElement('div'); 
            card.className='auction-card';
            card.style.display = 'grid';
            card.style.gridTemplateColumns = '1fr 1fr';
            card.style.gap = '1rem';
            card.innerHTML = `
                <div>
                    <img src="${a.img}" alt="${a.title}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:0.5rem;">
                    <h4 style="margin:0.3rem 0;font-size:1rem;">${a.title}</h4>
                    <div class="auction-meta">
                        <div class="auction-price" style="font-weight:bold;color:var(--accent);">${formatCurrency(a.currentBid)}</div>
                        <div class="auction-countdown" data-ends="${a.ends}" style="font-size:0.9rem;color:var(--text);">--:--:--</div>
                    </div>
                    <div style="display:flex;gap:0.3rem;margin-top:0.5rem;">
                        <a class="btn" href="product.html?id=${a.id}&auction=1" style="flex:1;font-size:0.9rem;padding:0.5rem;">Detalles</a>
                        <button class="btn bid-btn" data-id="${a.id}" style="flex:1;font-size:0.9rem;padding:0.5rem;">Pujar</button>
                    </div>
                </div>
                <div style="border-left:1px solid var(--border);padding-left:1rem;">
                    <h5 style="margin:0 0 0.5rem 0;font-size:0.9rem;color:var(--accent);">Historial de pujas</h5>
                    <div style="font-size:0.85rem;">${bidHistory}</div>
                </div>
            `;
            auctionGrid.appendChild(card);
        });
    }

    function updateCountdowns(){
        const els = document.querySelectorAll('.auction-countdown');
        els.forEach(el => {
            const ends = Number(el.dataset.ends);
            const diff = ends - Date.now();
            if(diff <= 0){ el.textContent = 'Finalizada'; return; }
            const s = Math.floor(diff/1000)%60;
            const m = Math.floor(diff/1000/60)%60;
            const h = Math.floor(diff/1000/3600);
            el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        });
    }

    // Interacción de puja con histórico
    document.addEventListener('click', (e)=>{
        const btn = e.target.closest('.bid-btn');
        if(!btn) return;
        const auctionId = btn.dataset.id;
        const auction = auctions.find(a=>a.id===auctionId);
        if(!auction) return;
        
        const increment = Math.max(1, Math.round(auction.currentBid*0.05));
        auction.currentBid = Math.round((auction.currentBid + increment)*100)/100;
        
        const randomUser = mockUsers[Math.floor(Math.random()*mockUsers.length)];
        if(!allBids[auctionId]) allBids[auctionId] = [];
        allBids[auctionId].push({userId:randomUser.id, amount:auction.currentBid, time:Date.now()});
        
        saveAuctions(auctions);
        saveBids(allBids);
        renderAuctions();
    });

    renderAuctions();
    updateCountdowns();
    setInterval(updateCountdowns,1000);
    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const logoNav = document.querySelector('.logo-nav');
    if(navToggle && logoNav){
        navToggle.addEventListener('click', ()=>{
            logoNav.classList.toggle('open');
            const expanded = logoNav.classList.contains('open');
            navToggle.setAttribute('aria-expanded', expanded);
        });
    }

    // --- Búsqueda simple de productos en la página ---
    const search = document.getElementById('siteSearch');
    if(search){
        search.addEventListener('input', (e)=>{
            const q = e.target.value.trim().toLowerCase();
            const cards = document.querySelectorAll('.product-card');
            cards.forEach(c=>{
                const name = (c.dataset.name || c.querySelector('h4')?.textContent || '').toLowerCase();
                c.style.display = (!q || name.includes(q)) ? '' : 'none';
            });
        });
    }

    const USERS_KEY = 'site_users_v1';
    const CURRENT_USER_KEY = 'current_user_v1';

    const formState = {
        registerForm: document.getElementById('registerForm'),
        loginForm: document.getElementById('loginForm'),
        contactForm: document.getElementById('contactForm'),
        registerMessage: document.getElementById('registerMessage'),
        loginMessage: document.getElementById('loginMessage'),
        contactResult: document.getElementById('contactResult'),
        contactMessageField: document.getElementById('contactMessage'),
        messageCounter: document.getElementById('messageCounter'),
        authModal: document.getElementById('authModal'),
        loginBtn: document.getElementById('loginBtn'),
        closeModal: document.getElementById('closeModal'),
        tabLogin: document.getElementById('tabLogin'),
        tabRegister: document.getElementById('tabRegister'),
        loginTab: document.getElementById('loginTab'),
        registerTab: document.getElementById('registerTab')
    };

    // --- Autenticación: almacenamiento local + inicialización desde js/users.json ---
    async function hashPassword(password){
        const enc = new TextEncoder();
        const data = enc.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
    }

    function loadUsers(){
        try{ return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }catch(e){ return []; }
    }

    function saveUsers(users){
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    async function initUsersFromJSON(){
        const existing = loadUsers();
        if(existing.length) return; // ya inicializado
        try{
            const res = await fetch('js/users.json', {cache: 'no-store'});
            if(!res.ok) return;
            const data = await res.json();
            // Esperamos que data sea un array con usuarios con campos: username,email,password (plain) opcional
            const users = [];
            for(const u of data){
                if(!u.email || !u.password) continue;
                const passHash = await hashPassword(u.password);
                users.push({id: crypto.randomUUID(), username: u.username||u.email.split('@')[0], email: u.email, passwordHash: passHash, createdAt: Date.now()});
            }
            if(users.length) saveUsers(users);
        }catch(e){ /* ignore */ }
    }

    function findUserByEmail(email){
        return loadUsers().find(u => u.email.toLowerCase() === (email||'').toLowerCase());
    }

    async function registerUser({username, email, password}){
        const exists = findUserByEmail(email);
        if(exists) return {ok:false, message: 'Ya existe una cuenta con ese email.'};
        const passwordHash = await hashPassword(password);
        const users = loadUsers();
        const user = { id: crypto.randomUUID(), username, email, passwordHash, createdAt: Date.now() };
        users.push(user);
        saveUsers(users);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({id: user.id, username: user.username, email: user.email}));
        return {ok:true, user};
    }

    async function loginUser({email,password}){
        const user = findUserByEmail(email);
        if(!user) return {ok:false, message:'Usuario no encontrado.'};
        const hash = await hashPassword(password);
        if(hash !== user.passwordHash) return {ok:false, message:'Contraseña incorrecta.'};
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({id: user.id, username: user.username, email: user.email}));
        return {ok:true, user};
    }

    function logoutUser(){
        localStorage.removeItem(CURRENT_USER_KEY);
        updateAuthUI();
    }

    function getCurrentUser(){
        try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); }catch(e){ return null; }
    }

    function updateAuthUI(){
        const cur = getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        if(loginBtn){
            if(cur){
                loginBtn.textContent = `👤 ${cur.username}`;
                loginBtn.title = 'Cuenta';
                loginBtn.setAttribute('aria-label','Cuenta');
                loginBtn.dataset.logged = '1';
            } else {
                loginBtn.textContent = '👤';
                loginBtn.title = 'Iniciar sesión';
                loginBtn.setAttribute('aria-label','Iniciar sesión');
                delete loginBtn.dataset.logged;
            }
        }
    }

    // Inicializar usuarios desde JSON si no hay datos
    initUsersFromJSON().then(()=> updateAuthUI());

    function getInputValue(id){
        const input = document.getElementById(id);
        return input ? input.value.trim() : '';
    }

    function clearMessage(el){
        if(!el) return;
        el.textContent = '';
        el.classList.remove('message--error', 'message--success');
    }

    function showMessage(el, text, type = 'error'){
        if(!el) return;
        el.textContent = text;
        el.classList.remove('message--error', 'message--success');
        el.classList.add(type === 'success' ? 'message--success' : 'message--error');
    }

    function isValidEmail(email){
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateRegister(data){
        const errors = [];
        if(!data.username) errors.push('Usuario obligatorio.');
        if(!data.email) errors.push('Email obligatorio.');
        else if(!isValidEmail(data.email)) errors.push('Email con formato incorrecto.');
        if(!data.password) errors.push('Contraseña obligatoria.');
        else if(data.password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres.');
        if(data.password !== data.confirmPassword) errors.push('Las contraseñas deben coincidir.');
        return errors;
    }

    function validateLogin(data){
        const errors = [];
        if(!data.email) errors.push('Email obligatorio.');
        else if(!isValidEmail(data.email)) errors.push('Email con formato incorrecto.');
        if(!data.password) errors.push('Contraseña obligatoria.');
        return errors;
    }

    function validateContact(data){
        const errors = [];
        if(!data.name) errors.push('Nombre obligatorio.');
        if(!data.email) errors.push('Email obligatorio.');
        else if(!isValidEmail(data.email)) errors.push('Email con formato incorrecto.');
        if(!data.subject) errors.push('Asunto obligatorio.');
        if(!data.message) errors.push('Mensaje obligatorio.');
        return errors;
    }


    function clearForm(form){
        if(!form) return;
        form.reset();
        const messages = form.querySelectorAll('.message');
        messages.forEach(msg => { msg.textContent = ''; msg.classList.remove('message--error', 'message--success'); });
    }

    function openModal(){
        if(formState.authModal){
            formState.authModal.classList.add('active');
            formState.authModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(){
        if(formState.authModal){
            formState.authModal.classList.remove('active');
            formState.authModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    function switchTab(tab){
        const tabs = ['login', 'register'];
        tabs.forEach(t => {
            const btn = formState[`tab${t.charAt(0).toUpperCase() + t.slice(1)}`];
            const content = formState[`${t}Tab`];
            if(t === tab){
                btn.classList.add('active');
                content.classList.add('active');
            } else {
                btn.classList.remove('active');
                content.classList.remove('active');
            }
        });
    }

    function handleRegisterSubmit(event){
        event.preventDefault();
        const payload = {
            username: getInputValue('registerUsername'),
            email: getInputValue('registerEmail'),
            password: getInputValue('registerPassword'),
            confirmPassword: getInputValue('registerConfirmPassword')
        };
        clearMessage(formState.registerMessage);
        const errors = validateRegister(payload);
        if(errors.length){
            showMessage(formState.registerMessage, errors.join(' '));
            return;
        }
        // Registrar usuario (almacenamiento local)
        registerUser({username: payload.username, email: payload.email, password: payload.password}).then(res => {
            if(!res.ok){
                showMessage(formState.registerMessage, res.message || 'Error al crear la cuenta.');
                return;
            }
            showMessage(formState.registerMessage, `Cuenta creada. Bienvenido ${payload.username}.`, 'success');
            updateAuthUI();
            setTimeout(()=>{
                clearForm(formState.registerForm);
                closeModal();
            }, 800);
        }).catch(err=>{
            showMessage(formState.registerMessage, 'Error interno al registrar.');
        });
    }

    function handleLoginSubmit(event){
        event.preventDefault();
        const payload = {
            email: getInputValue('loginEmail'),
            password: getInputValue('loginPassword')
        };
        clearMessage(formState.loginMessage);
        const errors = validateLogin(payload);
        if(errors.length){
            showMessage(formState.loginMessage, errors.join(' '));
            return;
        }
        loginUser(payload).then(res => {
            if(!res.ok){
                showMessage(formState.loginMessage, res.message || 'Credenciales incorrectas.');
                return;
            }
            showMessage(formState.loginMessage, 'Ingreso exitoso. Usuario autenticado.', 'success');
            updateAuthUI();
            setTimeout(()=>{
                clearForm(formState.loginForm);
                closeModal();
            },700);
        }).catch(err=>{
            showMessage(formState.loginMessage, 'Error interno al autenticar.');
        });
    }

    function updateMessageCounter(){
        if(!formState.contactMessageField || !formState.messageCounter) return;
        const count = formState.contactMessageField.value.length;
        formState.messageCounter.textContent = `${count}/250`;
        formState.messageCounter.classList.toggle('limit-exceeded', count > 250);
    }

    function handleContactSubmit(event){
        event.preventDefault();
        const payload = {
            name: getInputValue('contactName'),
            email: getInputValue('contactEmail'),
            subject: getInputValue('contactSubject'),
            message: getInputValue('contactMessage')
        };
        clearMessage(formState.contactResult);
        const errors = validateContact(payload);
        if(errors.length){
            showMessage(formState.contactResult, errors.join(' '));
            return;
        }
        showMessage(formState.contactResult, 'Mensaje enviado correctamente. Gracias por contactarnos.', 'success');
        clearForm(formState.contactForm);
        updateMessageCounter();
    }

    if(formState.registerForm){
        formState.registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    if(formState.loginForm){
        formState.loginForm.addEventListener('submit', handleLoginSubmit);
    }
    if(formState.contactForm){
        formState.contactForm.addEventListener('submit', handleContactSubmit);
    }
    if(formState.contactMessageField){
        formState.contactMessageField.addEventListener('input', updateMessageCounter);
        updateMessageCounter();
    }

    // Modal y tabs
    if(formState.loginBtn){
        formState.loginBtn.addEventListener('click', ()=>{
            const cur = getCurrentUser();
            if(cur){
                const ok = confirm(`¿Cerrar sesión de ${cur.username}?`);
                if(ok) logoutUser();
            } else {
                openModal();
            }
        });
    }
    if(formState.closeModal){
        formState.closeModal.addEventListener('click', closeModal);
    }
    if(formState.authModal){
        formState.authModal.addEventListener('click', (e) => {
            if(e.target === formState.authModal.querySelector('.modal-overlay')){
                closeModal();
            }
        });
    }
    if(formState.tabLogin){
        formState.tabLogin.addEventListener('click', () => switchTab('login'));
    }
    if(formState.tabRegister){
        formState.tabRegister.addEventListener('click', () => switchTab('register'));
    }

    // Delegación para botones "Agregar al carrito" desde cualquier página
    document.addEventListener('click', (e)=>{
        const add = e.target.closest('.add-to-cart');
        if(add){
            const id = add.dataset.id;
            const title = add.dataset.title || add.dataset.name || add.closest('.product-card')?.querySelector('h4')?.textContent || 'Artículo';
            const price = Number(add.dataset.price) || Number(add.closest('.product-card')?.querySelector('.price')?.textContent?.replace(/[^0-9.,]/g,'').replace(',','.') ) || 0;
            const img = add.dataset.img || add.closest('.product-card')?.querySelector('img')?.src || '';
            addToCart({id, title, price, img, qty:1});
        }
    });

})();
