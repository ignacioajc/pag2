// Modo oscuro con transición suave y generación de subastas de ejemplo
(function(){
    const body = document.body;
    const btn = document.getElementById('darkModeBtn');

    function setTheme(dark){
        if(dark) body.classList.add('darkmode'); else body.classList.remove('darkmode');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        btn.classList.toggle('active', dark);
        btn.setAttribute('aria-pressed', dark);
        btn.textContent = dark ? '☀️' : '🌙';
    }

    // Inicializar tema
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored ? stored === 'dark' : prefersDark);

    btn.addEventListener('click', ()=> setTheme(!document.body.classList.contains('darkmode')));

    // --- Subastas de ejemplo ---
    const auctions = [
        {id:'air-zone-1', title:'Air Zone 1 (Limited)', img:'images/bball-shoe.jpg', currentBid:129.99, ends: Date.now()+1000*60*60*6},
        {id:'raptor-gloves', title:'Guantes Raptor (Signed)', img:'images/boxing-gloves.jpg', currentBid:199.00, ends: Date.now()+1000*60*60*24},
        {id:'speedkick-fg', title:'SpeedKick FG (Rare)', img:'images/football-boot.jpg', currentBid:249.50, ends: Date.now()+1000*60*45}
    ];

    const auctionGrid = document.getElementById('auctionGrid');

    function formatCurrency(v){ return '€' + v.toFixed(2); }

    function renderAuctions(){
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
})();
