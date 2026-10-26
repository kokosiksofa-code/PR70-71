const money = n => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);

const read = k => {
    try {
        return JSON.parse(localStorage.getItem(k) || '{}');
    } catch {
        return {};
    }
};

const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const cart = () => read('loveli-cart'),
    fav = () => read('loveli-favorites');

const norm = s => String(s || '').toLocaleLowerCase('ru').replace(/[’‘`]/g, "'").replace(/ё/g, 'е').trim();

function updateCounts() {
    const c = cart(),
        f = fav();
    const cc = Object.values(c).reduce((a, b) => a + Number(b), 0);
    document.querySelectorAll('#cart-count').forEach(e => e.textContent = cc);
    document.querySelectorAll('#fav-count').forEach(e => e.textContent = Object.keys(f).length);
}

function toast(s) {
    const e = document.querySelector('#toast');
    if (!e) return;
    e.textContent = s;
    e.hidden = false;
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => e.hidden = true, 2400);
}

function addCart(id) {
    const c = cart();
    c[id] = (Number(c[id]) || 0) + 1;
    write('loveli-cart', c);
    updateCounts();
    toast('Товар добавлен в корзину');
}

function toggleFav(id) {
    const f = fav();
    if (f[id]) delete f[id];
    else f[id] = true;
    write('loveli-favorites', f);
    updateCounts();
    toast(f[id] ? 'Добавлено в желаемое' : 'Удалено из желаемого');
    renderProductsIfPresent();
}

function card(p) {
    const saved = !!fav()[p.id];
    return `<article class="product-card"><div class="product-image-wrap"><a class="product-image-link" href="/product.html?id=${p.id}" aria-label="Подробнее: ${p.name}"><img class="product-image" src="${p.image}" width="640" height="760" loading="lazy" alt="${p.name}, бренд ${p.brand}"></a>${p.badge ? `<span class="badge">${p.badge}</span>` : ''}<button class="heart ${saved ? 'saved' : ''}" aria-label="${saved ? 'Убрать из желаемого' : 'В желаемое'}: ${p.name}" onclick="toggleFav(${p.id})">${saved ? '♥' : '♡'}</button></div><div class="product-info"><div class="product-brand">${p.brand}</div><h3 class="product-name"><a href="/product.html?id=${p.id}">${p.name}</a></h3><p class="product-description">${p.description}</p><div class="price-row"><span class="price">${money(p.salePrice || p.price)} ${p.salePrice ? `<del class="old-price">${money(p.price)}</del>` : ''}</span><button class="add-btn" onclick="addCart(${p.id})">В корзину +</button></div></div></article>`;
}

function emptyProducts() {
    return '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">♡</div><h2>Пока ничего не найдено</h2><p class="muted">Попробуйте изменить запрос или посмотреть весь каталог.</p><a class="btn" href="/catalog.html">Перейти в каталог</a></div>';
}

function renderProducts(list) {
    const el = document.querySelector('[data-products]');
    if (el) el.innerHTML = list.length ? list.map(card).join('') : emptyProducts();
}

function getProductsForPage(includeQuery = true) {
    const el = document.querySelector('[data-products]');
    if (!el) return [];
    const type = el.dataset.type || 'all';
    let list = [...window.LOVELI_PRODUCTS];
    const params = new URLSearchParams(location.search);
    if (type === 'new') list = list.filter(p => p.badge === 'Новинка');
    else if (type === 'sale') list = list.filter(p => p.salePrice);
    else if (type === 'favorites') list = list.filter(p => fav()[p.id]);
    else if (type === 'brand') {
        const b = norm(params.get('brand'));
        list = list.filter(p => norm(p.brand).includes(b));
    }
    const q = includeQuery ? params.get('q') : '';
    if (q) list = list.filter(p => norm([p.name, p.brand, p.category, p.description].join(' ')).includes(norm(q)));
    if (el.dataset.ids) list = list.filter(p => el.dataset.ids.split(',').includes(String(p.id)));
    return list;
}

function renderProductsIfPresent() {
    const el = document.querySelector('[data-products]');
    if (el) renderProducts(getProductsForPage());
}

function initCatalog() {
    const grid = document.querySelector('[data-products]');
    if (!grid) return;
    const initialQuery = new URLSearchParams(location.search).get('q') || '';
    const input = document.querySelector('#catalog-search');
    if (input && initialQuery) input.value = initialQuery;
    const filter = () => {
        let list = getProductsForPage(false);
        const q = norm(input?.value || '');
        const category = document.querySelector('#category-filter')?.value || 'all';
        list = list.filter(p => (!q || norm([p.name, p.brand, p.category, p.description].join(' ')).includes(q)) && (category === 'all' || p.category === category));
        renderProducts(list);
    };
    filter();
    input?.addEventListener('input', filter);
    document.querySelector('#category-filter')?.addEventListener('change', filter);
}

function initDetail() {
    const el = document.querySelector('[data-detail]');
    if (!el) return;
    const id = Number(new URLSearchParams(location.search).get('id')) || 1;
    const p = window.LOVELI_PRODUCTS.find(x => x.id === id) || window.LOVELI_PRODUCTS[0];
    document.title = p.name + ' — Loveli';
    el.innerHTML = `<div class="detail-grid"><div class="detail-image"><img src="${p.image}" width="640" height="760" alt="${p.name}, ${p.brand}"></div><div><div class="eyebrow">${p.brand} · ${p.category}</div><h1 class="page-title">${p.name}</h1><p class="muted">${p.description}</p><p class="detail-price">${money(p.salePrice || p.price)} ${p.salePrice ? `<del class="old-price">${money(p.price)}</del>` : ''}</p><p class="muted">✓ В наличии · ✓ Бережная упаковка</p><div class="detail-actions"><button class="btn" onclick="addCart(${p.id})">Добавить в корзину</button><button class="btn btn-light" onclick="toggleFav(${p.id})">♡ В желаемое</button></div><h2 class="detail-subtitle">О товаре</h2><p class="muted">Подробная информация о товаре и его свойствах. Перед использованием ознакомьтесь с информацией на упаковке производителя.</p><a class="back-link" href="/catalog.html">← Вернуться в каталог</a></div></div>`;
    const related = document.querySelector('[data-related]');
    if (related) related.innerHTML = window.LOVELI_PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map(card).join('');
}

function initCart() {
    const el = document.querySelector('[data-cart]');
    if (!el) return;
    function draw() {
        const c = cart();
        const items = Object.entries(c).map(([id, qty]) => ({ p: window.LOVELI_PRODUCTS.find(x => x.id === Number(id)), qty: Number(qty) })).filter(x => x.p && x.qty > 0);
        const total = items.reduce((s, x) => s + (x.p.salePrice || x.p.price) * x.qty, 0);
        el.innerHTML = items.length ? `<div class="cart-layout"><div class="cart-items"><h2 class="section-title">Ваши товары</h2>${items.map(({ p, qty }) => `<div class="cart-row"><a href="/product.html?id=${p.id}"><img src="${p.image}" width="640" height="760" alt="${p.name}"></a><div class="cart-product"><div class="product-brand">${p.brand}</div><a href="/product.html?id=${p.id}"><strong>${p.name}</strong></a><p class="muted">${money(p.salePrice || p.price)}</p><button class="remove-link" onclick="removeCart(${p.id})">Удалить</button></div><div class="qty"><button onclick="changeQty(${p.id},-1)" aria-label="Уменьшить количество">−</button><span>${qty}</span><button onclick="changeQty(${p.id},1)" aria-label="Увеличить количество">+</button></div><strong class="line-total">${money((p.salePrice || p.price) * qty)}</strong></div>`).join('')}</div><aside class="summary-card"><h2>Итого</h2><div class="summary-row"><span>Товаров</span><span>${items.reduce((s, x) => s + x.qty, 0)}</span></div><div class="summary-row summary-total"><span>Сумма заказа</span><strong>${money(total)}</strong></div><a class="btn checkout-btn" href="/checkout.html">Перейти к оформлению</a><a class="continue-link" href="/catalog.html">Продолжить покупки</a></aside></div>` : '<div class="empty"><div class="empty-icon">♡</div><h2>Корзина пока пуста</h2><p class="muted">Добавьте любимые средства из каталога.</p><a class="btn" href="/catalog.html">Перейти в каталог</a></div>';
    }
    window.changeQty = (id, n) => {
        const c = cart();
        c[id] = (Number(c[id]) || 0) + n;
        if (c[id] <= 0) delete c[id];
        write('loveli-cart', c);
        updateCounts();
        draw();
    };
    window.removeCart = id => {
        const c = cart();
        delete c[id];
        write('loveli-cart', c);
        updateCounts();
        draw();
    };
    draw();
}

function initCheckout() {
    const form = document.querySelector('#checkout-form');
    if (!form) return;
    const getItems = () => Object.entries(cart()).map(([id, q]) => ({ p: window.LOVELI_PRODUCTS.find(x => x.id === Number(id)), q: Number(q) })).filter(x => x.p && x.q > 0);
    const total = () => getItems().reduce((s, x) => s + (x.p.salePrice || x.p.price) * x.q, 0);
    const totalEl = document.querySelector('#checkout-total');
    if (totalEl) totalEl.textContent = money(total());
    form.addEventListener('submit', e => {
        e.preventDefault();
        const items = getItems();
        if (!items.length) {
            toast('Сначала добавьте товары в корзину');
            location.href = '/cart.html';
            return;
        }
        const data = Object.fromEntries(new FormData(form));
        const orders = JSON.parse(localStorage.getItem('loveli-orders') || '[]');
        orders.unshift({ number: Date.now().toString().slice(-7), date: new Date().toLocaleDateString('ru-RU'), items: items.map(x => ({ p: x.p, q: x.q })), total: total(), name: data.name });
        localStorage.setItem('loveli-orders', JSON.stringify(orders));
        write('loveli-cart', {});
        updateCounts();
        form.innerHTML = `<div class="empty"><div class="empty-icon">✓</div><h2>Спасибо за заказ!</h2><p class="muted">Заказ №${orders[0].number} сохранён.</p><a class="btn" href="/catalog.html">Продолжить покупки</a><a class="continue-link" href="/account.html">Посмотреть историю заказов</a></div>`;
    });
}

function initAccount() {
    const el = document.querySelector('[data-orders]');
    if (el) {
        const orders = JSON.parse(localStorage.getItem('loveli-orders') || '[]');
        el.innerHTML = orders.length ? orders.map(o => `<div class="content-card order-card"><div class="price-row"><strong>Заказ №${o.number}</strong><span class="muted">${o.date}</span></div><p class="muted">${o.items.map(i => i.p.name + ' × ' + i.q).join(', ')}</p><strong>${money(o.total)}</strong></div>`).join('') : '<p class="muted">Здесь появятся ваши оформленные заказы.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCounts();
    initCatalog();
    initDetail();
    initCart();
    initCheckout();
    initAccount();
});