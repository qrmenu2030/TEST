// ------------------- Переменные -------------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const orderBtn = document.getElementById("orderBtn");
const clearBtn = document.getElementById("clearBtn");
const cartCount = document.getElementById("cartCount");

// ------------------- Показ/скрытие корзины -------------------
cartBtn.addEventListener("click", () => {
  cartModal.style.display = cartModal.style.display === "flex" ? "none" : "flex";
  renderCart();
});

function closeCart() {
  cartModal.style.display = "none";
}

// ------------------- Добавить товар -------------------
function addToCart(name, price) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  // Анимация кнопки
  const btn = event.currentTarget;
  btn.classList.add("active");
  setTimeout(() => btn.classList.remove("active"), 200);

  saveCart();
  renderCart();
}

// ------------------- Удалить товар -------------------
function removeFromCart(name) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.qty--;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
  }
  saveCart();
  renderCart();
}

// ------------------- Очистить корзину -------------------
clearBtn.addEventListener("click", () => {
  if (cart.length > 0) {
    cart = [];
    saveCart();
    renderCart();
  }
});

// ------------------- Оформить заказ через WhatsApp -------------------
orderBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  let message = "Здравствуйте! Хочу заказать:\n";
  let total = 0;

  cart.forEach(i => {
    message += `- ${i.name} x${i.qty} = ${i.price * i.qty} сомони\n`;
    total += i.price * i.qty;
  });

  // Текстовое предупреждение о доставке
  message += "\nДоставка: до 3 км — бесплатно, более 3 км — +10 сомони";
  message += `\nИтого: ${total} сомони`;

  const phone = "992123456789";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

// ------------------- Отображение корзины -------------------
function renderCart() {
  cartItems.innerHTML = "";

  let totalCount = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Корзина пуста</p>";
    orderBtn.classList.add("disabled");
    clearBtn.classList.add("disabled");
  } else {
    cart.forEach(i => {
      totalCount += i.qty;

      const div = document.createElement("div");
      div.classList.add("cart-item");

      div.innerHTML = `
        <span>${i.name} (${i.qty}) - ${i.price * i.qty} сомони</span>
        <span>
          <button class="plus" onclick="addToCart('${i.name}', ${i.price})"><i class="fas fa-plus"></i></button>
          <button class="minus" onclick="removeFromCart('${i.name}')"><i class="fas fa-minus"></i></button>
        </span>
      `;
      cartItems.appendChild(div);
    });
    orderBtn.classList.remove("disabled");
    clearBtn.classList.remove("disabled");
  }

  // Обновление счётчика на кнопке корзины
  cartCount.textContent = totalCount;
}

// ------------------- Сохранение корзины в localStorage -------------------
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ------------------- Переключение категорий -------------------
function showCategory(id) {
  document.querySelectorAll(".category").forEach(cat => cat.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

// ------------------- Инициализация -------------------
renderCart();