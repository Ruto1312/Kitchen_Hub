/* ============================================================
   APP LOGIC - cart, search, category filters, brand panel, modal,
   language switch. Loads after products.js and i18n.js.
   ============================================================ */
var baseProducts = mainProducts.concat(moreProducts);

/* ----- Cart state (saved in the browser so it survives a refresh) ----- */
var CART_KEY = "kitchenHavenCart";
var cart = {};
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { cart = {}; }
function save() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }

var products = [];
baseProducts.forEach(function(base){
  (categoryBrandMap[base.id]||["Panasonic","Philips"]).forEach(function(brand,index){
    var modelPrefix = {Panasonic:"SR",Philips:"HD",Tefal:"CY",Sharp:"R",Sunhouse:"SH",Kangaroo:"KG",PowerPac:"PP"}[brand]||"KH";
    var modelNum = String(100 + base.id.length*7 + index*13);
    products.push({
      id:base.id+"-"+brand.toLowerCase(), categoryId:base.id, name:base.name,
      img:(typeof brandImages!=="undefined"&&brandImages[base.id+"-"+brand.toLowerCase()])||base.img, desc:base.desc, price:Math.round(base.price*(brandPrices[brand]||1)*100)/100,
      brand:brand, model:modelPrefix+modelNum,
      specs:(base.specs||["Designed for everyday kitchen use","Easy-to-use controls","Compact modern design"]).slice(),
      demo:true
    });
  });
});
var all = products;
function money(n){return CURRENCY+n.toFixed(2)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function $(id){return document.getElementById(id)}
function find(id){return all.filter(function(p){return p.id===id})[0]}
function baseOf(id){return baseProducts.filter(function(p){return p.id===id})[0]}
/* Product text in the current language */
function nameOf(p){return pText(p.categoryId||p.id,"name",p.name)}
function descOf(p){return pText(p.categoryId||p.id,"desc",p.desc)}
function specsOf(p){return pText(p.categoryId||p.id,"specs",p.specs)}
function fullName(p){return p.brand+" "+nameOf(p)}

/* Category groups for the filter chips (key = translation key in i18n.js) */
var GROUPS={"Cooking":["air-fryer","pressure-cooker","multi-cooker","rice-cooker","indoor-grill","microwave"],
            "Prep":["blender","food-processor","electric-kettle"],
            "Breakfast":["toaster"],"Cooling":["mini-fridge"]};
var activeGroup="All";
function brandsOf(id){return all.filter(function(p){return p.categoryId===id});}
function fromPrice(id){return Math.min.apply(null,brandsOf(id).map(function(p){return p.price}));}

function categoryCard(base){
  var list=brandsOf(base.id);
  return '<button class="category-card" type="button" aria-expanded="false" data-category="'+base.id+'">'+
    '<div class="pic"><img src="'+esc(base.img)+'" alt="" loading="lazy"><span class="count-pill">'+t("card.brands",{n:num(list.length)})+'</span></div>'+
    '<div class="info"><h3>'+esc(nameOf(base))+'</h3><p class="meta">'+t("card.from",{p:'<b>'+money(fromPrice(base.id))+'</b>'})+'</p>'+
    '<span class="choose">'+t("card.compare")+' <span class="chev" aria-hidden="true">⌄</span></span></div></button>';
}
function renderChips(){
  $("chips").innerHTML=["All"].concat(Object.keys(GROUPS)).map(function(g){
    return '<button type="button" class="chip'+(g===activeGroup?' active':'')+'" data-group="'+esc(g)+'">'+t("g."+g)+'</button>';}).join("");
}
function renderProducts(){
  var reopen=openCard&&openCard.getAttribute("data-category");
  closePanel();
  var q=$("q").value.trim().toLowerCase();
  var categories=baseProducts.filter(function(base){
    if(activeGroup!=="All" && GROUPS[activeGroup].indexOf(base.id)<0) return false;
    if(!q) return true;
    // search both languages, plus brand names
    var my=PRODUCT_MY[base.id]||{};
    var text=[base.name,base.desc,my.name||"",my.desc||""].concat(categoryBrandMap[base.id]||[]).join(" ");
    return text.toLowerCase().indexOf(q)>-1;
  });
  $("category-grid").innerHTML=categories.map(categoryCard).join("");
  $("none").style.display=categories.length?"none":"block";
  return reopen;
}

/* ----- Brand panel: opens inline, right under the row of the clicked card ----- */
var openCard=null;
function brandCard(p,cheapest){
  return '<article class="bcard">'+
    (cheapest?'<span class="badge">'+t("best")+'</span>':'')+
    '<button class="bpic" data-open="'+p.id+'" aria-label="'+esc(t("details.for",{name:fullName(p)}))+'"><img src="'+esc(p.img)+'" alt=""></button>'+
    '<div class="bbody"><div class="brow"><span class="brand-tag">'+esc(p.brand)+'</span><span class="model">'+esc(p.model)+'</span></div>'+
    '<p class="bspec">'+esc(specsOf(p)[0]||descOf(p))+'</p>'+
    '<div class="bfoot"><span class="price">'+money(p.price)+'</span>'+
    '<span class="bactions"><button class="lnk" data-open="'+p.id+'">'+t("details")+'</button><button class="add" data-id="'+p.id+'" aria-label="'+esc(t("add.for",{name:fullName(p)}))+'">'+t("add")+'</button></span></div></div></article>';
}
function openPanel(cardEl,noScroll){
  var id=cardEl.getAttribute("data-category"), base=baseOf(id);
  var list=brandsOf(id).slice().sort(function(a,b){return a.price-b.price});
  closePanel();
  // find the last card on the same row, so the panel slides in below that row
  var cards=[].slice.call($("category-grid").querySelectorAll(".category-card")), top=cardEl.offsetTop, last=cardEl;
  cards.forEach(function(c){if(c.offsetTop===top) last=c;});
  var panel=document.createElement("div");
  panel.className="brand-panel"; panel.id="brand-panel";
  var r=cardEl.getBoundingClientRect(), g=$("category-grid").getBoundingClientRect();
  panel.style.setProperty("--arrow",(r.left-g.left+r.width/2)+"px");
  panel.innerHTML='<div class="phead"><div><p class="eyebrow">'+t("panel.count",{n:num(list.length)})+'</p><h3>'+esc(nameOf(base))+'</h3><p class="psub">'+esc(t("panel.sub",{desc:descOf(base)}))+'</p></div>'+
    '<button class="pclose" type="button" aria-label="'+esc(t("close"))+'">×</button></div>'+
    '<div class="bgrid">'+list.map(function(p,i){return brandCard(p,i===0)}).join("")+'</div>';
  last.insertAdjacentElement("afterend",panel);
  openCard=cardEl; cardEl.classList.add("open"); cardEl.setAttribute("aria-expanded","true");
  var pr=panel.getBoundingClientRect();
  if(!noScroll) track("view_brands",{category:base.name,ga:{name:"view_item_list",params:{item_list_id:id,item_list_name:base.name,items:list.map(function(p){return gaItem(p)})}}});
  if(!noScroll && pr.bottom>window.innerHeight) window.scrollBy({top:Math.min(pr.bottom-window.innerHeight+24, r.top-90),behavior:"smooth"});
}
function closePanel(){
  var p=$("brand-panel"); if(p) p.remove();
  if(openCard){openCard.classList.remove("open");openCard.setAttribute("aria-expanded","false");openCard=null;}
}

/* ----- Cart ----- */
var drawerView="vCart";
function renderCart(){
  var ids = Object.keys(cart).filter(function(id){return cart[id]>0&&find(id)});
  var count=0, total=0, html="";
  ids.forEach(function(id){
    var p=find(id), n=cart[id]; count+=n; total+=n*p.price;
    html+='<div class="line"><img class="thumb" src="'+esc(p.img)+'" alt=""><div><b>'+esc(fullName(p))+'</b><br><button class="rm" data-rm="'+id+'">'+t("d.remove")+'</button></div>'+
      '<div class="lright">'+money(n*p.price)+'<div class="qty"><button data-dec="'+id+'" aria-label="'+esc(t("d.fewer"))+'">−</button><span>'+n+'</span><button data-inc="'+id+'" aria-label="'+esc(t("d.more"))+'">+</button></div></div></div>';
  });
  $("items").innerHTML = ids.length ? html : '<p class="empty">'+t("d.empty")+'</p>';
  $("cfoot").style.display = ids.length ? "" : "none";
  $("count").textContent = count;
  $("total").textContent = $("total2").textContent = money(total);
}
function show(v){
  drawerView=v;
  ["vCart","vCheckout","vDone"].forEach(function(x){$(x).style.display = x===v ? "flex" : "none"});
  $("dtitle").textContent = t(v==="vCheckout" ? "d.checkout" : v==="vDone" ? "d.done" : "d.cart");
}
function openCart(){show("vCart");$("drawer").classList.add("open");$("overlay").classList.add("open")}
var toastTimer;
function toast(p){
  var el=$("toast");
  el.innerHTML='<span>✓ '+t("toast.added",{name:esc(fullName(p))})+'</span><button type="button" id="toastCart">'+t("toast.view")+'</button>';
  el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(function(){el.classList.remove("show")},3500);
  $("toastCart").onclick=function(){el.classList.remove("show");openCart();};
  var c=$("openCart"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
}
function closeCart(){$("drawer").classList.remove("open");$("overlay").classList.remove("open")}

document.addEventListener("click",function(e){
  var el=e.target.closest("[data-id],[data-inc],[data-dec],[data-rm]"), id;
  if(!el) return;
  if(id=el.getAttribute("data-id")){cart[id]=(cart[id]||0)+1;save();renderCart();toast(find(id));trackProduct("add_to_cart",find(id));}
  else if(id=el.getAttribute("data-inc")){cart[id]++;save();renderCart()}
  else if(id=el.getAttribute("data-dec")){cart[id]=Math.max(0,cart[id]-1);save();renderCart()}
  else if(id=el.getAttribute("data-rm")){delete cart[id];save();renderCart()}
});
$("openCart").onclick=openCart; $("closeCart").onclick=closeCart; $("overlay").onclick=closeCart;
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeCart()});
$("toCheckout").onclick=function(){show("vCheckout")};
$("back").onclick=function(){show("vCart")};
$("keep").onclick=closeCart;
$("co").addEventListener("submit",function(e){
  e.preventDefault();
  var ordno="KH"+Math.floor(10000+Math.random()*90000);
  $("ordno").textContent=ordno;
  var bought=Object.keys(cart).filter(function(id){return cart[id]>0&&find(id)});
  var value=bought.reduce(function(sum,id){return sum+cart[id]*find(id).price},0);
  track("order_placed",{
    product:bought.map(function(id){var p=find(id);return p.brand+" "+p.name+" x"+cart[id]}).join("; "),
    price:Math.round(value*100)/100,
    ga:{name:"purchase",params:{transaction_id:ordno,currency:"USD",value:value,items:bought.map(function(id){return gaItem(find(id),cart[id])})}}
  });
  cart={};save();renderCart();this.reset();show("vDone");
});
$("q").addEventListener("input",function(){renderProducts()});
$("category-grid").addEventListener("click",function(e){
  if(e.target.closest(".pclose")){var c=openCard;closePanel();if(c)c.focus();return;}
  var b=e.target.closest("[data-category]"); if(!b) return;
  if(openCard===b){closePanel();return;}
  openPanel(b);
});
$("chips").addEventListener("click",function(e){var b=e.target.closest("[data-group]");if(!b)return;activeGroup=b.getAttribute("data-group");renderChips();renderProducts();});
window.addEventListener("resize",function(){if(openCard){openPanel(openCard,true);}});
$("f").addEventListener("submit",function(e){e.preventDefault();$("ok").style.display="block";this.reset()});

/* ----- Product details window ----- */
var modalId=null;
function openModal(id){
  var p=find(id); if(!p) return; modalId=id;
  $("mbox").innerHTML = '<button class="mx" id="mclose" aria-label="'+esc(t("close"))+'">×</button>'+
    '<div class="pic"><img src="'+esc(p.img)+'" alt="'+esc(fullName(p))+'"></div>'+
    '<div class="mtext"><span class="brand-tag">'+esc(p.brand)+'</span><h2>'+esc(nameOf(p))+'</h2><p class="model-note">'+t("m.model")+': '+esc(p.model)+'</p><div class="price big">'+money(p.price)+'</div><p class="mdesc">'+esc(descOf(p))+'</p>'+
    '<h4>'+t("m.specs")+'</h4><ul>'+specsOf(p).map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+'</ul>'+
    '<button class="btn full" data-id="'+p.id+'">'+t("add.cart")+'</button><p class="sample">'+t("m.sample")+'</p></div>';
  $("modal").classList.add("open");
  $("mclose").focus();
}
function closeModal(){$("modal").classList.remove("open");modalId=null}
document.addEventListener("click",function(e){
  var o=e.target.closest("[data-open]");
  if(o){openModal(o.getAttribute("data-open"));trackProduct("view_details",find(o.getAttribute("data-open")));return}
  if(e.target.id==="modal"||e.target.id==="mclose") closeModal();
  if(e.target.closest("[data-id]")) closeModal();
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){ if($("modal").classList.contains("open")) closeModal(); else if(openCard){var c=openCard;closePanel();c.focus();} }
});

/* ----- Language switch (EN / မြန်မာ) ----- */
function renderAll(){
  applyStaticText();
  $("hero-stat").innerHTML=t("hero.stat",{c:num(baseProducts.length),b:num(Object.keys(brandPrices).length)});
  renderChips();
  var reopen=renderProducts();
  if(reopen){var c=$("category-grid").querySelector('[data-category="'+reopen+'"]'); if(c) openPanel(c,true);}
  renderCart(); show(drawerView);
  if(modalId) openModal(modalId);
}
document.querySelector(".lang").addEventListener("click",function(e){
  var b=e.target.closest("[data-lang]"); if(!b||b.getAttribute("data-lang")===LANG) return;
  LANG=b.getAttribute("data-lang");
  try{localStorage.setItem("kitchenHavenLang",LANG)}catch(err){}
  track("switch_language",{product:LANG==="my"?"Burmese":"English"});
  renderAll();
});

renderAll();
track("page_view");

/* helper: send one product event to the Sheet and Google Analytics */
function trackProduct(event,p){
  if(!p) return;
  var ga={add_to_cart:"add_to_cart",view_details:"view_item"}[event];
  track(event,{category:p.name,brand:p.brand,product:p.brand+" "+p.name,price:p.price,
    ga:{name:ga,params:{currency:"USD",value:p.price,items:[gaItem(p)]}}});
}
