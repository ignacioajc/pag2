// Genera datos de precios del último año y renderiza gráfico estilo StockX
(function(){
    function qs(name){
        return new URLSearchParams(location.search).get(name);
    }

    const id = qs('id') || 'unknown';
    const products = {
        'air-zone-1': {title:'Air Zone 1', img:'images/bball-shoe.jpg', base:130},
        'raptor-gloves': {title:'Guantes Raptor', img:'images/boxing-gloves.jpg', base:180},
        'speedkick-fg': {title:'SpeedKick FG', img:'images/football-boot.jpg', base:220},
        'kimono-pro-x': {title:'Kimono Pro X', img:'images/kids-gi.jpg', base:60},
        'balon-elite': {title:'Balón Elite', img:'images/basketball.jpg', base:35},
        'balon-match': {title:'Balón Match', img:'images/football.jpg', base:45},
        'unknown': {title:'Artículo', img:'images/basketball.jpg', base:100}
    };

    const p = products[id] || products.unknown;
    document.getElementById('productTitle').textContent = p.title;
    document.getElementById('productImg').src = p.img;

    // Generar precios para los últimos 365 días (random walk)
    const days = 365;
    const labels = [];
    const values = [];
    let price = p.base;
    const start = Date.now() - (days-1)*24*60*60*1000;
    for(let i=0;i<days;i++){
        const dt = new Date(start + i*24*60*60*1000);
        labels.push(dt.toLocaleDateString('es-ES',{month:'short',day:'numeric'}));
        // random walk pct -1.5%..+1.5%
        const pct = (Math.random()-0.5)*0.03;
        price = Math.max(5, price * (1 + pct));
        values.push(Math.round(price*100)/100);
    }

    // Resumen
    const max = Math.max(...values);
    const min = Math.min(...values);
    const last = values[values.length-1];

    document.getElementById('summaryMax').textContent = 'Max ' + '€' + max.toFixed(2);
    document.getElementById('summaryMin').textContent = 'Min ' + '€' + min.toFixed(2);
    document.getElementById('summaryLast').textContent = '€' + last.toFixed(2);
    document.getElementById('currentPrice').textContent = '€' + last.toFixed(2);

    // Lista de precios (mensual: cada ~30 días)
    const historyEl = document.getElementById('priceHistory');
    for(let m=0;m<12;m++){
        const idx = Math.floor((m/11)*(values.length-1));
        const v = values[idx];
        const div = document.createElement('div');
        div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:.9rem;color:#666">Hace ${12-m}m</div><div class="price-badge ${v>last? 'up':'down'}">€${v.toFixed(2)}</div></div>`;
        historyEl.appendChild(div);
    }

    // Chart.js
    const ctx = document.getElementById('priceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0,0,0,200);
    gradient.addColorStop(0,'rgba(59,35,82,0.28)');
    gradient.addColorStop(1,'rgba(59,35,82,0.02)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Precio (€)',
                data: values,
                borderColor: '#3a2352',
                backgroundColor: gradient,
                fill: true,
                pointRadius: 0.8,
                tension: 0.18,
            }]
        },
        options: {
            plugins: {legend:{display:false}},
            scales: {
                x: {display:false},
                y: {grid:{color:'rgba(0,0,0,0.06)'}, ticks:{callback:function(v){return '€'+v}}}
            },
            elements:{line:{borderWidth:2}}
        }
    });

})();
