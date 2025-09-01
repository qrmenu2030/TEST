const sheetID = "1536OW6-bxV0sE8X7V8sd9iSudAzyO4pdvImX1PL9WWY"; 
const sheetName = "Лист1";
const query = encodeURIComponent("select A,B,C,D");
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}&tq=${query}`;

let cart = [];

function gvizToJson(gvizText) {
  const jsonText = gvizText.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/)[1];
  return JSON.parse(jsonText);
}

function updateCartUI() {
  const cartContainer = document.getElementById("cart-modal");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const emptyMsg = document.getElementById("empty-msg");
  const sendBtn = document.getElementById("send-order");
  cartItems.innerHTML = "";
  let total = 0;

  if(cart.length === 0) {
    emptyMsg.style.display = "block";
    sendBtn.classList.add("disabled");
    document.getElementById("clear-cart").classList.add("disabled");
  } else {
    emptyMsg.style.display = "none";
    sendBtn.classList.remove("disabled");
    document.getElementById("clear-cart").classList.remove("disabled");

    cart.forEach((item, idx) => {
      total += item.price * item.qty;
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <span>${item.name}</span>
        <div>
          <span>${item.price * item.qty} c</span>
          <button class="qty-btn minus">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn plus">+</button>
        </div>
      `;
      cartItems.appendChild(li);

      li.querySelector(".plus").addEventListener("click", () => { item.qty++; updateCartUI(); });
      li.querySelector(".minus").addEventListener("click", () => { item.qty--; if(item.qty <=0) cart.splice(idx,1); updateCartUI(); });
    });
  }

  cartTotal.textContent = total;
  document.getElementById("cart-count").textContent = cart.reduce((a,b)=>a+b.qty,0);
  const itemsText = cart.map(i => `${i.qty}× ${i.name}`).join(", ");
  sendBtn.href = `https://wa.me/992123456789?text=Хочу заказать: ${encodeURIComponent(itemsText)}`;
}

function addToCart(item) {
  const existing = cart.find(i=>i.name===item.name);
  if(existing) existing.qty++;
  else cart.push({...item, qty:1});
  updateCartUI();
}

document.getElementById("clear-cart").addEventListener("click", ()=>{ cart=[]; updateCartUI(); });

document.getElementById("cart-btn").addEventListener("click", ()=>{ document.getElementById("cart-modal").classList.add("active"); });
document.getElementById("cart-close").addEventListener("click", ()=>{ document.getElementById("cart-modal").classList.remove("active"); });

document.getElementById("search-input").addEventListener("input", e=>{
  const val = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card=>{
    const name = card.querySelector(".name").textContent.toLowerCase();
    const desc = card.querySelector(".muted")?.textContent.toLowerCase()||"";
    card.style.display = name.includes(val)||desc.includes(val)?"flex":"none";
  });
});

fetch(url)
  .then(res=>res.text())
  .then(rep=>{
    const data = gvizToJson(rep);
    const container = document.getElementById("menu-container");
    const loading = document.getElementById("loading");
    const categories = {};

    data.table.rows.forEach(row=>{
      const img = row.c[0]?.v;
      const name = row.c[1]?.v;
      const price = parseFloat(row.c[2]?.v);
      const category = row.c[3]?.v || "Без категории";

      if(!categories[category]) categories[category]=[];
      categories[category].push({img,name,price});
    });

    Object.keys(categories).forEach(cat=>{
      const h2 = document.createElement("h2");
      h2.textContent = cat;
      h2.className = "section";
      container.appendChild(h2);

      const grid = document.createElement("div");
      grid.className = "grid";

      categories[cat].forEach(item=>{
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="thumb" style="background-image:url('${item.img}')"></div>
          <div class="info">
            <div class="name">${item.name}</div>
            <div class="muted"></div>
          </div>
          <div class="card-footer">
            <div class="price">${item.price} c</div>
            <button class="add"><i class="fa-solid fa-plus"></i></button>
          </div>
        `;
        grid.appendChild(card);

        card.querySelector(".add").addEventListener("click", ()=> addToCart(item));
      });

      container.appendChild(grid);
    });

    loading.style.display = "none";
    container.style.display = "block";
  })
  .catch(err=>{
    console.error("Ошибка загрузки меню:", err);
    document.getElementById("menu-container").innerHTML="<p>Не удалось загрузить меню. Проверьте публикацию таблицы.</p>";
  });