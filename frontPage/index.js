// 設定全域 url ＆ api path
let baseUrl = 'https://livejs-api.hexschool.io/api';
let api_path = 'karen666';

// 產品列表 & 購物車列表 data
let productListData = [];
let cartListData = [];

// 初始化 data 資料
function init() {
    getProductListData();
    getCartListData();
}

init();

// 1. (get) 載入產品列表 API
function getProductListData() {
    let url = `${baseUrl}/livejs/v1/customer/${api_path}/products`;

    axios.get(url)
        .then(function (response) {
            // console.log(response.data.products);
            productListData = response.data.products;
            renderProductList(productListData);  // 渲染產品列表 (productSelect也渲染一次)
            getProductCategory(); // 產品類別下拉選單選項不寫死
            productSelect(); // 篩選購物車品項 (要先有category才能取值，所以要放getProductCategory()後方)
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 2. (get) 載入購物車列表 API
function getCartListData() {
    let url = `${baseUrl}/livejs/v1/customer/${api_path}/carts`

    axios.get(url)
        .then(function (response) {
            cartListData = response.data.carts;
            renderCartList(cartListData);
        })
}

// 3. (post) 加入購物車 API
// 購物車的 id 要從 product list 去抓

function addCartItem(productId) {

    let url = `${baseUrl}/livejs/v1/customer/${api_path}/carts`;
    let order = {
        data: {
            "productId": productId,
            "quantity": 1
        }
    }

    axios.post(url, order)
        .then(function (response) {
            //   console.log(response.data.carts);
            renderCartList(response.data.carts);
            alert('商品已成功加入購物車')
        })
        .catch(function (error) {
            console.log(error);
        })
}

// 4. (delete) 刪除全部購物車 API
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', deleteAllCartList)

function deleteAllCartList() {
    let url = `${baseUrl}/livejs/v1/customer/${api_path}/carts`;

    axios.delete(url)
        .then(function (response) {
            // console.log(response.data);
            renderCartList(response.data.carts);
            alert('購物車已全部清空！')
        })
}

// 5. (delete) 刪除個別購物車項目 API
function deleteCartItem(cartId) {

    let url = `${baseUrl}/livejs/v1/customer/${api_path}/carts/${cartId}`;

    axios.delete(url)
        .then(function (response) {
            console.log(response.data);
            renderCartList(response.data.carts);
            alert('購物車品項已刪除！')
        })
}

// 以下購物車渲染畫面相關
// 綁定要 forEach 帶入的購物車商品
const cartItemDataArea = document.querySelector('.cartItemDataArea');
const totalPrice = document.querySelector('#totalPrice');

// 渲染畫面 => 購物車列表
function renderCartList(newCartListData) {

    let cartItemDataContent = ''
    let cartListPrice = 0;
    
    // post 購物車 API 有新的購物車資料會傳入這個函式
    newCartListData.forEach(function (item) {

        cartItemDataContent += `
                <tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="${item.product.title}">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.origin_price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${item.product.price}</td>
                    <td class="discardBtn">
                        <a href="###" class="material-icons eachDiscardBtn" data-id="${item.id}">
                            clear
                        </a>
                    </td>
                </tr>
        `

        // 計算總金額
        cartListPrice += Number(item.product.price)
        
    })

    
    cartItemDataArea.innerHTML = cartItemDataContent;
    // 總金額
    let totalPriceStr = `NT$${cartListPrice}`
    totalPrice.textContent = totalPriceStr;

    const eachDiscardBtn = document.querySelectorAll('.eachDiscardBtn');
    eachDiscardBtn.forEach(function (item) {
        // console.log(item);
        item.addEventListener('click', getDeleteCartId)
    })
    // console.log(eachDiscardBtn)
    function getDeleteCartId(e) {
        // console.log(e.target.dataset.id);
        deleteCartItem(e.target.dataset.id)
    }
}


// 以下產品列表渲染畫面相關
// 綁定 DOM: 產品列表 ul
const productWrap = document.querySelector('.productWrap');
// 綁定 DOM: 產品下拉選單 篩選商品
const productSelectArea = document.querySelector('.productSelect');

// 渲染畫面 => 產品列表
function renderProductList(selectedProducts) {

    let cardContent = '';

    selectedProducts.forEach(function (item) {
        cardContent += `
        <li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="${item.title}">
                <a href="###" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`
    })

    productWrap.innerHTML = cardContent;

    // 綁定 DOM
    const addToCartBtn = document.querySelectorAll('.addCardBtn');
    addToCartBtn.forEach(function (item) {
        item.addEventListener('click', getProductId)
    })

    function getProductId(e) {
        addCartItem(e.target.dataset.id);
    }

}

// 產品類別下拉選單綁定監聽
productSelectArea.addEventListener('change', productSelect)

function productSelect() {

    let selectedProducts = [];

    productListData.forEach(function (item) {

        if (productSelectArea.value === item.category) {
            selectedProducts.push(item)
            renderProductList(selectedProducts);
        }
    })

    if (productSelectArea.value === '全部') {
        renderProductList(productListData);
    }

}

function getProductCategory() {
    // 用 map 抓出所有類別
    let allCategories = productListData.map(function (item) {
        return item.category
    })

    // 過濾掉重複的 category
    let eachCategory = allCategories.filter(function (item, index) {
        return allCategories.indexOf(item) === index;
    })
    renderCategories(eachCategory)
}

// 取得類別 跟 資料畫上畫面分開寫功能
function renderCategories(eachCategory) {

    let categoryContent = '<option value="全部" selected>全部</option>'
    eachCategory.forEach(function (item) {
        categoryContent += `<option value="${item}">${item}</option>`
    })
    productSelectArea.innerHTML = categoryContent;
}

// 6. (post) 訂單相關 API (客戶送出訂單用)
// 送出購買訂單
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');

function createOrder() {

    let url = `${baseUrl}/livejs/v1/customer/${api_path}/orders`
    let order = {
        "data": {
          "user": {
            "name": customerName.value.trim(),
            "tel": customerPhone.value.trim(),
            "email": customerEmail.value.trim(),
            "address": customerAddress.value.trim(),
            "payment": tradeWay.value.trim()
          }
        }
      }

    axios.post(url, order)
      .then(function (response) {
        console.log(response.data);
        order = {}
        // getCartListData();
        alert('訂單已成功送出！')
      })
      .catch(function(error){
        console.log(error.response.data);
      })
  }

let constraints = {
    姓名: {
        presence: {
            message: "是必填欄位"
        }
    },
    電話: {
        presence: {
            message: "是必填欄位"
        }
    },
    Email: {
        presence: {
            message: "是必填欄位"
        }
    },
    寄送地址: {
        presence: {
            message: "是必填欄位"
        }
    },
    交易方式: {
        presence: {
            message: "是必填欄位"
        }
    }
};

const orderInfoForm = document.querySelector('.orderInfo-form');
const input = document.querySelectorAll("input[type=text], input[type=tel], input[type=email]");
// 把所有 data-message 屬性都選取起來 (都在input範圍)
let alertMsg = document.querySelectorAll('[data-message]');

// form 上面綁定 遞交事件
orderInfoForm.addEventListener('submit', verification, false)
function verification(e){
    e.preventDefault();
    let errors = validate(orderInfoForm, constraints);  // 這邊 orderInfoForm 功能是 validate 套件會去比對？
    // 如果驗證套件發現有錯誤，就會回傳值，有值就是 truthy 會執行
    if(errors){
        errorsAlert(errors);
    }else{
        // 如果驗證套件沒發現錯誤，不會回傳值，errors 就是 falsy，會執行 else
        createOrder()
    }
}

function errorsAlert(errors){
    
    alertMsg.forEach(function(item){
        
        item.textContent = '';
        item.textContent = errors[item.dataset.message]
    })
}

// input 欄位一更動，會隨驗證套件的結果而改變
input.forEach(function(item){
    item.addEventListener('change', function(e){
        e.preventDefault();
        let targetName = item.name;
        let errors = validate(orderInfoForm, constraints);
        item.nextElementSibling.textContent = "";

        if(errors){
            document.querySelector(`[data-message='${targetName}']`).textContent = errors[targetName];
        }
    })
})
