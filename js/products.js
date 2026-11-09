/* ============================================================
   PRODUCT DATA - edit this file to change products, prices,
   brands and photos. No other file needs to change.
   - Photos live in the images/ folder (images/<product-id>.jpg)
   - Final price = base price x brand multiplier (brandPrices)
   ============================================================ */
/* CURRENCY: prices in this file are in US dollars.
   Shoppers can switch between MMK and USD. MMK = USD x EXCHANGE_RATE, rounded to 100 Ks.
   If your Google Sheet has a "Settings" tab, the rate written there is used instead,
   so you can change it without editing this file (see tracking/SETUP.md). */
var EXCHANGE_RATE = 4500;
var SAMPLE = "Sample details for demonstration. Replace with the real product's specifications.";
var mainProducts = [
  {id:"air-fryer",       name:"Air fryer",       img:"images/air-fryer.jpg",       desc:"Crispy food with little oil", price:89,
   specs:["Capacity: about 4–5 L","Power: about 1500 W","Digital timer and temperature control","Good for fries, chicken and vegetables"], brands:""},
  {id:"pressure-cooker", name:"Pressure cooker", img:"images/pressure-cooker.jpg", desc:"Cook meals in less time",     price:65,
   specs:["Capacity: about 5–6 L","Stainless steel body","Safety valve and locking lid","Works on gas and induction (check model)"], brands:"Sunhouse (cookware maker)"},
  {id:"microwave",       name:"Microwave",       img:"images/microwave.jpg",       desc:"Heat and cook in minutes",    price:120,
   specs:["Capacity: about 20–25 L","Power: about 800 W","Defrost and auto-cook presets","Child lock"], brands:"Panasonic"},
  {id:"electric-kettle", name:"Electric kettle", img:"images/electric-kettle.jpg", desc:"Boil water fast",             price:25,
   specs:["Capacity: about 1.7 L","Power: about 1800 W","Auto shut-off and boil-dry protection","Cordless base"], brands:"Kangaroo"},
  {id:"blender",         name:"Blender",         img:"images/blender.jpg",         desc:"Smoothies, soups and sauces", price:45,
   specs:["Jar: about 1.5 L","Power: about 500 W","Multiple speeds and pulse","Removable blades for cleaning"], brands:"Panasonic"}
];
var moreProducts = [
  {id:"food-processor", name:"Food processor", img:"images/food-processor.jpg", desc:"Chop, slice and mix quickly",     price:75,
   specs:["Bowl: about 1.5–2 L","Slicing, shredding and chopping discs","Power: about 600 W","Dishwasher-safe parts (check model)"], brands:""},
  {id:"multi-cooker",   name:"Multi cooker",   img:"images/multi-cooker.jpg",   desc:"Several cooking modes in one",    price:110,
   specs:["Capacity: about 5 L","Modes: pressure cook, steam, saute, slow cook","Keep-warm function","Preset programs"], brands:""},
  {id:"mini-fridge",    name:"Mini fridge",    img:"images/mini-fridge.jpg",    desc:"Compact cooling for small spaces",price:180,
   specs:["Capacity: about 50–90 L","Small freezer compartment","Low noise","Fits dorms, offices and small kitchens"], brands:"Panasonic (refrigerators)"},
  {id:"indoor-grill",   name:"Indoor grill",   img:"images/indoor-grill.jpg",   desc:"Grill all year round",            price:70,
   specs:["Non-stick grill plates","Power: about 1500 W","Adjustable temperature","Drip tray for easy cleaning"], brands:"Kangaroo (electric grills)"},
  {id:"toaster",        name:"Toaster",        img:"images/toaster.jpg",        desc:"Golden toast every morning",      price:30,
   specs:["2 slots","Browning control dial","Defrost and cancel buttons","Removable crumb tray"], brands:""},
  {id:"rice-cooker",    name:"Rice cooker",    img:"images/rice-cooker.jpg",    desc:"Perfect rice, no watching",       price:55,
   specs:["Capacity: about 1.8 L","Keep-warm function","Steamer tray included","Non-stick inner pot"], brands:"Panasonic, PowerPac"}
];

/* Which brands are sold for each category (2 to 4 brands each - they appear
   as slices in the round brand picker), and the price multiplier per brand */
var categoryBrandMap = {
  "air-fryer":["Philips","Tefal"],
  "pressure-cooker":["Panasonic","Tefal","Sunhouse"],
  "microwave":["Panasonic","Sharp"],
  "electric-kettle":["Panasonic","Philips","Kangaroo"],
  "blender":["Panasonic","Philips"],
  "food-processor":["Philips","Panasonic"],
  "multi-cooker":["Panasonic","Tefal"],
  "mini-fridge":["Panasonic","Sharp"],
  "indoor-grill":["Philips","Tefal","Kangaroo"],
  "rice-cooker":["Panasonic","Philips","PowerPac","Sharp"],
  "toaster":["Philips","Panasonic"]
};
var brandPrices = {"Panasonic":1.08,"Philips":1.18,"Tefal":1.12,"Sharp":1.05,"Sunhouse":0.95,"Kangaroo":0.97,"PowerPac":0.92};

/* BRAND PHOTOS (optional): give one brand's product its own photo.
   Key = "<category-id>-<brand in lowercase>". Any product not listed here
   uses the category photo. Example:
   "air-fryer-philips": "images/air-fryer-philips.jpg",                  */
var brandImages = {
};
