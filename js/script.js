let cart = JSON.parse(localStorage.getItem('cart') || '[]');
updateCartUI();

const sheetID = "1536OW6-bxV0sE8X7V8sd9iSudAzyO4pdvImX1PL9WWY";

// Загружаем данные из Google Sheets
window.addEventListener('DOMContentLoaded', () => {
  Tabletop.init({
    key: sheetID,
    simpleSheet: true,
    callback: populateMenu
  });

  // Поиск товаров
  document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const name = card.querySelector('.name').textContent.toLowerCase();
      if(name.includes(searchTerm)) card.style.display = 'flex';
      else card.style.display = 'none';
    });
  });
});

// Функция создания карточек меню
function populateMenu(data){
  const grids = {
    "Бургеры": document.getElementById('burgers-grid'),
    "Пицца": document.getElementById('pizza-grid'),
    "Хот-доги": document.getElementById('hotdog-grid'),
    "Буррито": document.getElementById('burrito-grid'),
    "Закуски и гарниры": document.getElementById('snacks-grid'),
    "Напитки": document.getElementById('drink-grid'),
    "Десерты": document.getElementById('dessert-grid')
  };

  data.forEach(item => {
    const cat = item['Категория'] || 'Бургеры';
    const grid = grids[cat] || grids['Бургеры'];

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb" style="background-image: url('${item['Фото (URL)'] || ''}')"></div>
      <div class="info">
        <div class="name">${item['Название']}</div>
        <div class="muted">${item['Описание'] || ''}</div>
      </div>
      <div class="card-footer">
        <div class="price">${item['Цена']} c</div>
        <button class="add" onclick="addToCart('${item['Название']}',${item['Цена']}, '${cat.toLowerCase()}')">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- КОРЗИНА ---
function addToCart(name, price, category){ 
  const ex = cart.find(i => i.name === name); 
  if(ex) ex.qty++; 
  else cart.push({name, price, qty: 1, category});
  saveCart(); updateCartUI(); toast(name + " добавлен в корзину"); 
}

function changeQty(idx, delta){ 
  cart[idx].qty += delta; 
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  saveCart(); updateCartUI(); 
}

function saveCart() { 
  localStorage.setItem('cart', JSON.stringify(cart)); 
}

function updateCartUI() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const send = document.getElementById('send-order');
  const clearBtn = document.getElementById('clear-cart');
  const cartCount = document.getElementById('cart-count');
  const emptyMsg = document.getElementById('empty-msg');
  
  list.innerHTML = '';
  let total = 0;
  let text = '🛒 Заказ:\n';
  
  if(cart.length === 0){ 
    emptyMsg.style.display='block'; 
    send.classList.add('disabled'); 
    clearBtn.classList.add('disabled'); 
  } else { 
    emptyMsg.style.display='none'; 
    send.classList.remove('disabled'); 
    clearBtn.classList.remove('disabled'); 
    
    cart.forEach((item,i)=>{ 
      const lineTotal = item.price*item.qty; 
      total += lineTotal;
      text += `${item.qty}× ${item.name} — ${lineTotal} c\n`; 

      let iconClass='fa-utensils';
      if(item.category.includes('pizza')) iconClass='fa-pizza-slice';
      else if(item.category.includes('hotdog')) iconClass='fa-hotdog';
      else if(item.category.includes('drink')) iconClass='fa-glass-water';
      else if(item.category.includes('dessert')) iconClass='fa-ice-cream';

      const li = document.createElement('li');
      li.className='cart-item';
      li.innerHTML = `
        <div class="line-left">
          <i class="fa-solid ${iconClass}"></i>
          <span class="line-name">${item.name}</span>
        </div>
        <div class="line-right" style="display:flex;align-items:center;gap:8px;">
          <span class="line-total">${lineTotal} c</span>
          <button class="qty-btn" onclick="changeQty(${i},-1)"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-pill">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)"><i class="fa-solid fa-plus"></i></button>
        </div>
      `;
      list.appendChild(li);
    });
  }

  totalEl.textContent = total + ' c';
  cartCount.textContent = cart.reduce((a,b)=>a+b.qty,0);
  const phone = '992123456789'; // номер WhatsApp
  const msg = encodeURIComponent(text + `\nИтого: ${total} c`);
  send.href = `https://wa.me/${phone}?text=${msg}`;
}

// Очистка корзины
document.getElementById('clear-cart').addEventListener('click', () => { 
  if(cart.length === 0) return; 
  if(confirm('Очистить корзину?')) {
    cart = []; saveCart(); updateCartUI(); toast('Корзина очищена');
  }
});

// Открытие/закрытие корзины
document.getElementById('cart-btn').addEventListener('click', ()=>{ document.getElementById('cart-modal').classList.add('active'); });
document.getElementById('cart-close').addEventListener('click', ()=>{ document.getElementById('cart-modal').classList.remove('active'); });
document.getElementById('cart-modal').addEventListener('click', (e)=>{ if(e.target.id==='cart-modal') document.getElementById('cart-modal').classList.remove('active'); });

// Всплывающие уведомления
function toast(txt){
  const t=document.createElement('div'); 
  t.className='toast'; 
  t.textContent=txt; 
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.transition='opacity .2s'; t.style.opacity='0'; }, 2000);
  setTimeout(()=>t.remove(), 2300);
}