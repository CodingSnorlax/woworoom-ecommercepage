//  設定全域 url ＆ api path
let baseUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin`;
let api_path = 'karen666'
let authorization = {
    headers: {
        'Authorization': '7iybGwRS9jdR63WtLodtJ8KWfgJ2'
    }
}

// 全域變數：儲存訂單資料
let orderListData = []

// (1) 取得訂單列表資料 API
function getOrderList() {
    let url = `${baseUrl}/${api_path}/orders`;

    axios.get(url, authorization)
        .then(function (response) {
            console.log(response.data.orders);
            orderListData = response.data.orders;
            renderOrderList()
            renderChart()
        })
        .then(function () {
            // 在這邊才綁得到 DOM
            const orderStatus = document.querySelectorAll('.orderStatus');
            orderStatus.forEach(function (item) {
                item.addEventListener('click', editOrderList);
            })
            // 取出特定購物車 id，進行刪除
            const deleteOrderBtn = document.querySelectorAll('.delSingleOrder-Btn')
            deleteOrderBtn.forEach(function (item) {
                item.addEventListener('click', deleteOrderItem)
            })
        })
}

// 呼叫這筆函式，帶入API資料到 orderListData 上
getOrderList()

// 渲染訂單資料到畫面上
const customerInfo = document.querySelector('.customerInfo')
// Q1: 產品有很多項，要不要全部顯示？但是是在陣列內？
// Q2: 訂單日期跟狀態要寫在 renderOrderList 內，還是獨立一個函式較好？

function renderOrderList() {

    let customerInfoContent = ''

    orderListData.forEach(function (item) {

        // 組出訂單日期
        let orderTime = new Date(item.updatedAt * 1000)
        const year = orderTime.getFullYear();
        const month = orderTime.getMonth() + 1;
        const date = orderTime.getDate();

        customerInfoContent += `<tr>
                        <td>${item.id}</td>
                        <td>
                          <p>${item.user.name}</p>
                          <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                          <p>${item.products[0].title}</p>
                        </td>
                        <td>${year}/${month}/${date}</td>
                        <td>
                          <a href="###" class="orderStatus" data-id="${item.id}" data-status="${item.paid}">${item.paid ? '已處理' : '未處理'}</a>
                        </td>
                        <td>
                          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                        </td>
                    </tr>`

    })

    customerInfo.innerHTML = customerInfoContent;

}

// (2) 修改訂單狀態
function editOrderList(e) {

    e.preventDefault();
    let url = `${baseUrl}/${api_path}/orders`;

    let isPaid;
    if (e.target.dataset.status === 'false') {
        isPaid = false;
    } else {
        isPaid = true;
    }

    let orderStatus = {
        "data": {
            "id": e.target.dataset.id,
            "paid": !isPaid,
        }
    }

    axios.put(url, orderStatus, authorization)
        .then(function (response) {
            console.log(response.data.orders);
            getOrderList()
            alert('訂單狀態已更改')
        })
}

// (3) 刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', deleteAllOrder)

function deleteAllOrder() {
    let url = `${baseUrl}/${api_path}/orders`;

    axios.delete(url, authorization)
        .then(function (response) {
            console.log(response.data.orders);
            getOrderList();
            alert('購物車已全部清空！')
        })
}

// (4) 刪除特定一筆訂單資料

function deleteOrderItem(e) {
    e.preventDefault();
    let orderId = e.target.dataset.id;
    let url = `${baseUrl}/${api_path}/orders/${orderId}`

    axios.delete(url, authorization)
        .then(function (response) {
            console.log(response.data.orders);
            getOrderList();
            alert('訂單已刪除！')
        })
}

function renderChart() {

    // 統計出商品的種類及對應到的數量
    let productAmount = {}
    orderListData.forEach(function (item) {

        let productList = item.products;
        productList.forEach(function (item) {

            if (productAmount[item.title] === undefined) {
                productAmount[item.title] = 0
            }

            productAmount[item.title] += item.quantity

        })
    })

    // 將統計好的商品及數量用 object.keys 取出種類，組出一個由商品種類組成的陣列
    let productAmountKeys = Object.keys(productAmount)
    let eachProductTotalAry = []
    productAmountKeys.forEach(function(key){
        
        let eachProductTotalObj = {}
        eachProductTotalObj.product = key;
        eachProductTotalObj.amount = productAmount[key]
        eachProductTotalAry.push(eachProductTotalObj)
        
    })

    function compare(a, b){
        return  b.amount - a.amount
    }

    eachProductTotalAry.sort(compare)
    
    let sortDataObj = {}

    eachProductTotalAry.forEach(function(item, index){

        if(index > 2){

            if(sortDataObj['其他'] === undefined){
                sortDataObj['其他'] = 0
            }
            sortDataObj['其他'] += eachProductTotalAry[index].amount;

        }else{
            
            if(sortDataObj[eachProductTotalAry[index].product] === undefined){
                sortDataObj[eachProductTotalAry[index].product] = 0
            }

            sortDataObj[eachProductTotalAry[index].product] += eachProductTotalAry[index].amount

        }
    })

    console.log(sortDataObj);

    let sortproductKeys = Object.keys(sortDataObj)

    let chartData = []

    // 由商品種類組成的陣列 拿來跑forEach，帶回剛才的物件，取出對應的數量，再組出圖表所需的資料
    sortproductKeys.forEach(function (key) {
        let ary = []
        ary.push(key)
        ary.push(sortDataObj[key])
        chartData.push(ary)
    })

    console.log(chartData);
    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: chartData,
        },
    });


}


