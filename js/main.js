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
        const clear = e.target.closest('#clearCart'); if(clear){ localStorage.removeItem(CART_KEY); renderCartPanel(); updateCartCount(); return; }
        const checkout = e.target.closest('#checkoutBtn'); if(checkout){ alert('Checkout demo — integrar pasarela de pago'); localStorage.removeItem(CART_KEY); renderCartPanel(); updateCartCount(); return; }
    });

    // Iniciar contador de carrito
    updateCartCount();

    // ---------------- Subastas de ejemplo ----------------
    const auctions = [
        {id:'air-zone-1', title:'Air Zone 1 (Limited)', img:'images/bball-shoe.svg', currentBid:129.99, ends: Date.now()+1000*60*60*6},
        {id:'raptor-gloves', title:'Guantes Raptor (Signed)', img:'images/boxing-gloves.svg', currentBid:199.00, ends: Date.now()+1000*60*60*24},
        {id:'speedkick-fg', title:'SpeedKick FG (Rare)', img:'images/football-boot.svg', currentBid:249.50, ends: Date.now()+1000*60*45}
    ];

    const auctionGrid = document.getElementById('auctionGrid');

    function formatCurrency(v){ return '€' + v.toFixed(2); }

    function renderAuctions(){
        if(!auctionGrid) return;
        auctionGrid.innerHTML = '';
        auctions.forEach(a => {
            const card = document.createElement('div'); card.className='auction-card';
            card.innerHTML = `
                <img src="${a.img}" alt="${a.title}">
                <h4>${a.title}</h4>
                <div class="auction-meta">
                    <div class="auction-price">${formatCurrency(a.currentBid)}</div>
                    <div class="auction-countdown" data-ends="${a.ends}">--:--:--</div>
                </div>
                <div style="display:flex;gap:.5rem;justify-content:space-between;align-items:center;">
                    <a class="btn" href="product.html?id=${a.id}&auction=1">Ir a subasta</a>
                    <button class="btn bid-btn" data-id="${a.id}">Pujar</button>
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

    // Interacción simple de puja (mock)
    document.addEventListener('click', (e)=>{
        const btn = e.target.closest('.bid-btn');
        if(!btn) return;
        const id = btn.dataset.id;
        const auction = auctions.find(a=>a.id===id);
        if(!auction) return;
        const increment = Math.max(1, Math.round(auction.currentBid*0.05));
        auction.currentBid = Math.round((auction.currentBid + increment)*100)/100;
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
