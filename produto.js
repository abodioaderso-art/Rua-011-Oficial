
const PRODUCTS = [
  {id:1,name:"Air force 1 nocta",brand:"Branco",price:649.90,image:"img/air force 1 nocta.jpg",color:"Branco",variants:[
    {color:"Branco",image:"img/air force 1 nocta.jpg"},
    {color:"Preto",image:"img/air force 1 nocta preto.jpg"},
    {color:"Cinza",image:"img/air force 1 nocta cinza.jpg"}
  ]},
  {id:2,name:"Air max 95",brand:"Neon",price:1099.90,image:"img/air max 95.jpg",color:"Vermelho"},
  {id:3,name:"Air jordan 4",brand:"Preto e Vermelho",price:729.90,image:"img/air jordan 4.jpg",color:"Verde"},
  {id:4,name:"Dn 4",brand:"Preto e Roxo",price:799.90,image:"img/dn 4.jpg",color:"Azul"},
  {id:5,name:"Dn 8",brand:"Verde e Cinza",price:899.90,image:"img/dn 8.jpg",color:"Branco"},
  {id:6,name:"Tn Atlanta",brand:"Rosa",price:699.90,image:"img/tn atlanta.jpg",color:"Preto"},
  {id:7,name:"Puma Ferrari",brand:"Branco",price:529.90,image:"img/puma ferrari.jpg",color:"Vinho"},
  {id:8,name:"Nike Low Panda",brand:"Panda",price:429.90,image:"img/dunk low panda.jpg",color:"Cinza"},
  {id:9,name:"Nike Nocta Hot Step",brand:"Branco",price:1399.90,image:"img/nike nocta hot step 2.jpg",color:"Cinza"},
  {id:10,name:"Puma Bmw",brand:"Preto",price:449.90,image:"img/puma bmw.jpg",color:"Vinho"},
  {id:11,name:"Air max Skepta",brand:"Vermelho",price:799.90,image:"img/air max skepta.jpg",color:"Cinza"},
  {id:12,name:"Air Jordan 4 Verde",brand:"Verde",price:899.90,image:"img/air jordan 4 verde.jpg",color:"Verde"}
];

const money = value => value.toLocaleString("pt-BR", {
  style:"currency",
  currency:"BRL"
});

const id = Number(new URLSearchParams(window.location.search).get("id"));
const product = PRODUCTS.find(item => item.id === id);

const image = document.getElementById("product-image");
const colorsBox = document.getElementById("product-colors");
const sizesBox = document.getElementById("product-sizes");
const message = document.getElementById("product-message");

let selectedColor = "";
let selectedSize = "";
let selectedImage = "";

const sizes = [38,39,40,41,42,43,44,45];

if (!product) {
  document.getElementById("product-name").textContent = "Produto não encontrado";
} else {

  document.title = product.name + " | RUA 011";

  document.getElementById("product-brand").textContent = product.brand;
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-price").textContent = money(product.price);

  document.getElementById("product-installments").textContent =
    "Em até 12x de " + money(product.price / 12);

  const variants = product.variants || [
    {color:product.color || "Padrão",image:product.image}
  ];

  selectedColor = variants[0].color;
  selectedImage = variants[0].image;

  image.src = selectedImage;
  image.alt = product.name + " na cor " + selectedColor;

  variants.forEach(variant => {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = variant.color;
    button.setAttribute("aria-pressed",String(variant.color === selectedColor));

    button.addEventListener("click",() => {

      selectedColor = variant.color;
      selectedImage = variant.image;

      image.src = selectedImage;
      image.alt = product.name + " na cor " + selectedColor;

      colorsBox.querySelectorAll("button").forEach(b => {
        b.setAttribute("aria-pressed",String(b === button));
      });

    });

    colorsBox.appendChild(button);

  });

  sizes.forEach(size => {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = size;
    button.setAttribute("aria-pressed","false");

    button.addEventListener("click",() => {

      selectedSize = String(size);

      sizesBox.querySelectorAll("button").forEach(b => {
        b.setAttribute("aria-pressed",String(b === button));
      });

    });

    sizesBox.appendChild(button);

  });

  document.getElementById("add-product").addEventListener("click",() => {

    if (!selectedSize) {
      message.textContent = "Escolha um tamanho antes de adicionar à sacola.";
      return;
    }

    const key = "nove-cart";
    let cart = [];

    try {
      cart = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      cart = [];
    }

    const line = cart.find(item =>
      item.id === product.id &&
      item.color === selectedColor &&
      item.size === selectedSize
    );

    if (line) {
      line.qty += 1;
    } else {
      cart.push({
        id:product.id,
        name:product.name,
        brand:product.brand,
        price:product.price,
        image:selectedImage,
        qty:1,
        color:selectedColor,
        size:selectedSize
      });
    }

    localStorage.setItem(key,JSON.stringify(cart));

    message.textContent =
      product.name + " adicionado à sacola!";

  });

}
