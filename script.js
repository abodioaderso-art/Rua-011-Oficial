/* NOVE SNKRS — versão estática (HTML + CSS + JS)
   Inclui: catálogo, busca, sacola, favoritos por usuário,
   login/cadastro local e painel de acessibilidade. */

const PRODUCTS = [
  { id:1, name:"Air force 1 nocta",   brand:"Branco", price:649.90, oldPrice:899.90, image:"img/air force 1 nocta.jpg", badge:"Oferta",     color:"Branco" },
  { id:2, name:"Air max 95",    brand:"Neon",     price:1099.90,               image:"img/air max 95.jpg", badge:"Lançamento", color:"Vermelho" },
  { id:3, name:"Air jordan 4", brand:"Preto e Vermelho",   price:729.90,                image:"img/air jordan 4.jpg", badge:"Tendência",       color:"Verde" },
  { id:4, name:"Dn 4",   brand:"Preto e Roxo",   price:799.90, oldPrice:999.90, image:"img/dn 4.jpg", badge:"Oferta",    color:"Azul" },
  { id:5, name:"Dn 8",  brand:"Verde e Cinza",    price:899.90,    image:"img/dn 8.jpg", badge:"Lançamento" , color:"Branco" },
  { id:6, name:"Tn Atlanta",brand:"Rosa",   price:699.90,  image:"img/tn atlanta.jpg",     color:"Preto" },
  { id:7, name:"Puma Ferrari",brand:"Branco",    price:529.90,                image:"img/puma ferrari.jpg",                   color:"Vinho" },
  { id:8, name:"Nike Low Panda",  brand:"Panda",    price:429.90,               image:"img/dunk low panda.jpg",  color:"Cinza" },
  { id:9, name:"Nike Nocta Hot Step",  brand:"Branco",    price:1399.90,               image:"img/nike nocta hot step 2.jpg",  color:"Cinza" },
  { id:10, name:"Puma Bmw",brand:"Preto",    price:449.90,                image:"img/puma bmw.jpg",                   color:"Vinho" },
  { id:11, name:"Air max Skepta",  brand:"Vermelho",    price:799.90, oldPrice:1199.90  ,               image:"img/air max skepta.jpg",  color:"Cinza" },
  { id:12, name:"Air Jordan 4 ",  brand:"Verde ",  price:899.90,              image:"img/air jordan 4 verde.jpg",  color:"Cinza" },
];

const CATEGORIES = [
  { label:"Masculino",  copy:"Seleção masculina",     image:"img/cat-masculino.jpg" },
  { label:"Feminino",   copy:"Seleção feminina",      image:"img/cat-feminino.jpg" },
  { label:"Sneakers",   copy:"Todos os modelos",      image:"img/cat-sneakers.jpg" },
  
];

const brl = (n) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const live = (msg) => { const el = document.getElementById("live-region"); el.textContent = ""; setTimeout(() => { el.textContent = msg; }, 50); };
const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

/* ============ acessibilidade ============ */
const A11Y_KEY = "nove-a11y";
const a11yDefaults = { contrast:false, bigtext:false, dyslexia:false, links:false, motion:false, spacing:false };
let a11y = { ...a11yDefaults, ...store.get(A11Y_KEY, {}) };

function applyA11y() {
  const b = document.body;
  for (const k of Object.keys(a11yDefaults)) b.classList.toggle(`a11y-${k}`, !!a11y[k]);
  if (a11y.dyslexia) b.classList.add("a11y-dyslexia");
  document.querySelectorAll(".a11y-toggle").forEach((b) => b.setAttribute("aria-pressed", String(!!a11y[b.dataset.a11y])));
  store.set(A11Y_KEY, a11y);
}

const a11yBtn = document.getElementById("a11y-btn");
const a11yPanel = document.getElementById("a11y-panel");
a11yBtn.addEventListener("click", () => {
  const open = a11yPanel.hidden;
  a11yPanel.hidden = !open;
  a11yBtn.setAttribute("aria-expanded", String(open));
  if (open) a11yPanel.querySelector("button").focus();
});
document.querySelectorAll(".a11y-toggle").forEach((b) =>
  b.addEventListener("click", () => {
    a11y[b.dataset.a11y] = !a11y[b.dataset.a11y];
    applyA11y();
    live(`${b.textContent} ${a11y[b.dataset.a11y] ? "ativado" : "desativado"}.`);
  })
);
document.getElementById("a11y-reset").addEventListener("click", () => {
  a11y = { ...a11yDefaults };
  applyA11y();
  live("Preferências de acessibilidade restauradas.");
});
applyA11y();

/* ============ conta (localStorage) ============ */
const USERS_KEY = "nove-users";
const SESSION_KEY = "nove-session";
let users = store.get(USERS_KEY, []);
let session = store.get(SESSION_KEY, null);

const currentUser = () => users.find((u) => u.id === session?.userId) || null;

const hash = (str) => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

const authModal = document.getElementById("auth-modal");
const authError = document.getElementById("auth-error");
let lastFocus = null;

function renderAuth() {
  const user = currentUser();
  document.getElementById("auth-logged-out").hidden = !!user;
  document.getElementById("auth-logged-in").hidden = !user;
  document.getElementById("auth-hello").textContent = user ? `Olá, ${user.name}!` : "";
  document.getElementById("auth-title").textContent = user ? "Sua conta" : "Entrar na sua conta";
  document.getElementById("account-label").textContent = user ? `Conta de ${user.name}` : "Entrar ou criar conta";
  authError.textContent = "";
  renderFavorites();
}

function openAuth() {
  lastFocus = document.activeElement;
  authModal.hidden = false;
  renderAuth();
  (currentUser() ? document.getElementById("logout-btn") : document.getElementById("login-email")).focus();
}
function closeAuth() {
  authModal.hidden = true;
  if (lastFocus) lastFocus.focus();
}

document.getElementById("account-btn").addEventListener("click", openAuth);
document.getElementById("auth-close").addEventListener("click", closeAuth);
authModal.addEventListener("click", (e) => { if (e.target === authModal) closeAuth(); });

/* abas entrar/cadastrar */
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
function selectTab(signup) {
  tabLogin.classList.toggle("is-active", !signup);
  tabSignup.classList.toggle("is-active", signup);
  tabLogin.setAttribute("aria-selected", String(!signup));
  tabSignup.setAttribute("aria-selected", String(signup));
  document.getElementById("panel-login").hidden = signup;
  document.getElementById("panel-signup").hidden = !signup;
}
tabLogin.addEventListener("click", () => selectTab(false));
tabSignup.addEventListener("click", () => selectTab(true));

document.getElementById("panel-signup").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("su-name").value.trim();
  const email = document.getElementById("su-email").value.trim().toLowerCase();
  const pass = document.getElementById("su-pass").value;
  if (users.some((u) => u.email === email)) { authError.textContent = "Este e-mail já tem cadastro. Tente entrar."; return; }
  const user = { id: crypto.randomUUID(), name, email, passHash: hash(pass) };
  users.push(user);
  store.set(USERS_KEY, users);
  session = { userId: user.id };
  store.set(SESSION_KEY, session);
  migrateGuestFavorites(user.id);
  renderAuth();
  live(`Conta criada. Bem-vindo, ${name}!`);
});

document.getElementById("panel-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const pass = document.getElementById("login-pass").value;
  const user = users.find((u) => u.email === email && u.passHash === hash(pass));
  if (!user) { authError.textContent = "E-mail ou senha incorretos."; return; }
  session = { userId: user.id };
  store.set(SESSION_KEY, session);
  migrateGuestFavorites(user.id);
  renderAuth();
  live(`Login feito. Olá, ${user.name}!`);
});

document.getElementById("logout-btn").addEventListener("click", () => {
  session = null;
  localStorage.removeItem(SESSION_KEY);
  renderAuth();
  live("Você saiu da conta.");
});

/* ============ favoritos ============ */
const GUEST_FAV_KEY = "nove-favorites:guest";
const favKey = () => `nove-favorites:${session?.userId || "guest"}`;
let favorites = store.get(favKey(), []);

function migrateGuestFavorites(userId) {
  const guest = store.get(GUEST_FAV_KEY, []);
  if (!guest.length) { favorites = store.get(favKey(), []); return; }
  const mine = new Set([...store.get(favKey(), []), ...guest]);
  favorites = [...mine];
  store.set(favKey(), favorites);
  localStorage.removeItem(GUEST_FAV_KEY);
}

function saveFavorites() { store.set(favKey(), favorites); renderFavorites(); }

function renderFavorites() {
  const favGrid = document.getElementById("fav-grid");
  const favEmpty = document.getElementById("fav-empty");
  const favCount = document.getElementById("fav-count");
  favCount.textContent = favorites.length;
  document.getElementById("fav-btn-label").textContent = `Ver favoritos, ${favorites.length} itens`;
  const list = PRODUCTS.filter((p) => favorites.includes(p.id));
  favGrid.innerHTML = list.map(cardHTML).join("");
  favEmpty.hidden = list.length > 0;
  if (!currentUser() && list.length)
    favEmpty.hidden = false,
    favEmpty.textContent = "Você está navegando sem conta: entre para manter seus favoritos neste navegador.",
    favGrid.parentNode.appendChild(favEmpty);
  else if (!list.length)
    favEmpty.textContent = "Você ainda não favoritou nenhum par. Use o coração nos produtos.";
}

function toggleFavorite(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (favorites.includes(id)) {
    favorites = favorites.filter((x) => x !== id);
    live(`${p.name} removido dos favoritos.`);
  } else {
    favorites.push(id);
    live(`${p.name} adicionado aos favoritos.`);
  }
  saveFavorites();
  renderProducts();
}

/* ============ catálogo ============ */
const grid = document.getElementById("catalogo");
const emptyMsg = document.getElementById("empty");
const resultsStatus = document.getElementById("results-status");
let activeFilter = "todos";
let term = "";

function cardHTML(p) {
  const fav = favorites.includes(p.id);

  return `
    <li class="card">
      <div class="card__media">
        ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}

        <button class="card__fav ${fav ? "is-fav" : ""}"
          data-fav="${p.id}"
          aria-pressed="${fav}"
          aria-label="${fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
          ${fav ? "♥" : "♡"}
        </button>

        <a href="produto.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </a>
      </div>

      <div class="card__body">
        <span class="card__brand">${p.brand}</span>

        <h3 class="card__name">
          <a href="produto.html?id=${p.id}">${p.name}</a>
        </h3>

        <div class="card__price">
          <b>${brl(p.price)}</b>
          ${p.oldPrice ? `<s>${brl(p.oldPrice)}</s>` : ""}
        </div>

        <p class="card__note">
          em até 12x de ${brl(p.price / 12)}
        </p>

        <button class="btn btn--primary" data-add="${p.id}">
          Adicionar à sacola
        </button>

        <a class="btn btn--primary" href="produto.html?id=${p.id}">
          Ver produto
        </a>
      </div>
    </li>`;
}

function visibleProducts() {
  return PRODUCTS.filter((p) => {
    const okFilter = activeFilter === "todos" || p.badge === activeFilter;
    const okTerm = !term || (p.name + " " + p.brand + " " + p.color).toLowerCase().includes(term);
    return okFilter && okTerm;
  });
}

function renderProducts() {
  const list = visibleProducts();
  emptyMsg.hidden = list.length > 0;
  grid.innerHTML = list.map(cardHTML).join("");
  resultsStatus.textContent = `${list.length} produto${list.length === 1 ? "" : "s"} exibido${list.length === 1 ? "" : "s"}.`;
}

document.getElementById("cats").innerHTML = CATEGORIES.map((c) => `
  <li><a class="cat" href="#novidades">
    <img src="${c.image}" alt="Categoria ${c.label}: ${c.copy}" loading="lazy" />
    <div class="cat__label"><strong>${c.label}</strong><span>${c.copy}</span></div>
  </a></li>`).join("");

/* ============ sacola ============ */
const KEY = "nove-cart";
let cart = store.get(KEY, []);

const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");

function saveCart() { store.set(KEY, cart); renderCart(); }

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = count;
  document.getElementById("cart-btn-label").textContent = `Abrir sacola, ${count} itens`;
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  cartTotalEl.textContent = brl(total);
  cartItemsEl.innerHTML = cart.length
    ? cart.map((i) => `
      <div class="line">
        <img src="${i.image}" alt="${i.name}" />
        <div class="line__info">
          <strong>${i.name}</strong>
          <span>${i.brand} · ${brl(i.price)}</span>
          <div class="qty">
            <button data-dec="${i.id}" aria-label="Diminuir quantidade de ${i.name}">−</button>
            <span aria-label="Quantidade: ${i.qty}">${i.qty}</span>
            <button data-inc="${i.id}" aria-label="Aumentar quantidade de ${i.name}">+</button>
            <button data-del="${i.id}" aria-label="Remover ${i.name} da sacola">✕</button>
          </div>
        </div>
      </div>`).join("")
    : `<p class="empty">Sua sacola está vazia.</p>`;
}

function addToCart(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  const line = cart.find((x) => x.id === id);
  if (line) line.qty += 1;
  else cart.push({ id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image, qty: 1 });
  saveCart();
  live(`${p.name} adicionado à sacola.`);
  openDrawer();
}

/* ============ drawer ============ */
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const cartBtn = document.getElementById("cart-btn");
const openDrawer = () => {
  drawer.classList.add("is-open"); overlay.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  cartBtn.setAttribute("aria-expanded", "true");
};
const closeDrawer = () => {
  drawer.classList.remove("is-open"); overlay.hidden = true;
  drawer.setAttribute("aria-hidden", "true");
  cartBtn.setAttribute("aria-expanded", "false");
};

cartBtn.addEventListener("click", openDrawer);
document.getElementById("drawer-close").addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeDrawer();
  if (!authModal.hidden) closeAuth();
  if (!a11yPanel.hidden) { a11yPanel.hidden = true; a11yBtn.setAttribute("aria-expanded", "false"); }
});

document.getElementById("checkout").addEventListener("click", () => {
  if (!cart.length) { live("Sua sacola está vazia."); return; }
  alert("Checkout de demonstração: pedido registrado com sucesso!");
  cart = [];
  saveCart();
  closeDrawer();
  live("Pedido registrado com sucesso.");
});

/* ============ eventos ============ */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.add) addToCart(Number(t.dataset.add));
  if (t.dataset.fav) toggleFavorite(Number(t.dataset.fav));
  if (t.dataset.inc) { cart.find((i) => i.id === Number(t.dataset.inc)).qty++; saveCart(); }
  if (t.dataset.dec) {
    const line = cart.find((i) => i.id === Number(t.dataset.dec));
    line.qty > 1 ? line.qty-- : (cart = cart.filter((i) => i.id !== line.id));
    saveCart();
  }
  if (t.dataset.del) { cart = cart.filter((i) => i.id !== Number(t.dataset.del)); saveCart(); }
  if (t.dataset.filter) {
    activeFilter = t.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("is-active", c === t);
      c.setAttribute("aria-pressed", String(c === t));
    });
    renderProducts();
  }
});

document.getElementById("search").addEventListener("input", (e) => {
  term = e.target.value.trim().toLowerCase();
  renderProducts();
});

const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
});
document.querySelectorAll(".nav a").forEach((a) =>
  a.addEventListener("click", () => { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); })
);

document.getElementById("fav-btn").addEventListener("click", () => {
  document.getElementById("favoritos").scrollIntoView({ behavior: a11y.motion ? "auto" : "smooth" });
});

document.getElementById("news-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("news-email");
  const emails = store.get("nove-news", []);
  if (!emails.includes(input.value)) { emails.push(input.value); store.set("nove-news", emails); }
  document.getElementById("news-status").textContent = "Inscrição confirmada. Obrigado!";
  input.value = "";
});

renderProducts();
renderCart();
renderAuth();
renderFavorites();
