const sheetID = "1536OW6-bxV0sE8X7V8sd9iSudAzyO4pdvImX1PL9WWY";

// Функция для создания карточки
function createCard(item) {
  return `
    <div class="card">
      <div class="thumb" style="background-image: url('${item["Фото (URL)"]}')"></div>
      <div class="info">
        <div class="name">${item["Название"]}</div>
        <div class="muted">${item["Описание"] || ""}</div>
      </div>
      <div class="card-footer">
        <div class="price">${item["Цена"]} c</div>
        <button class="add" onclick="addToCart('${item["Название"]}', ${item["Цена"]}, '${item["Категория"]}')">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  `;
}

// Инициализация Tabletop
Tabletop.init({
  key: sheetID,
  simpleSheet: true,
  callback: function(data) {
    data.forEach(item => {
      const category = item["Категория"].toLowerCase();
      const container = document.getElementById(`${category}-grid`);
      if(container) container.innerHTML += createCard(item);
    });
  }
});

// --- Корзина ---
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function addToCart(name, price, category){ 
  const ex = cart.find(i => i.name === name); 
  if(ex) ex.qty++; 
  else cart.push({name, price, qty:1, category}); 
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${name} добавлен в корзину`);
}

// --- Поиск ---
document.getElementById('search-input').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('.name').textContent.toLowerCase();
    const desc = card.querySelector('.muted').textContent.toLowerCase();
    card.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? 'flex' : 'none';
  });
});