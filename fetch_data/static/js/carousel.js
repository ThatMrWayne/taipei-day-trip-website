let leftButton = document.querySelector('.carousel__button--left');
let rightButton = document.querySelector('.carousel__button--right');
let nodes = []; //存放Node物件的list
let currentNode; //標示目前哪個Node是顯示在畫面上的

class Node {
    constructor(self) {
        this.self = self;
        this.next = null;
        this.prev = null;
    }

    addNext(nextNode) {
        this.next = nextNode;
    }

    addPrevious(prevNode) {
        this.prev = prevNode;
    }
}


class Linked_list {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    addNodes(nodes) {
        let temp_prev;
        let temp;
        if (!this.head) {
            this.head = nodes[0];
            temp = this.head;

        };
        let prev = null;
        for (let i = 1; i < nodes.length; i++) {
            temp.addNext(nodes[i]);
            temp.addPrevious(prev);
            prev = temp;
            temp = temp.next;
        }
        temp.addNext(this.head);
        temp.addPrevious(prev);
        this.tail = temp;
        this.head.addPrevious(this.tail);

    }
}

let linkedList = new Linked_list();


async function getData(id) {
    try {
        let url = `/api/attraction/${id}`
        let sightData = await fetch(url);
        if (sightData.ok) {
            let parsed_sightData = await sightData.json();
            let imgs = parsed_sightData.data.image;
            //創造node物件(li tag)
            for (let i = 0; i < imgs.length; i++) {
                let li = document.createElement('li');
                li.className = "carousel__slide";
                let img = new Image();
                img.src = imgs[i];
                img.setAttribute('class', "carousel__image");
                li.appendChild(img);
                node = new Node(li);
                nodes.push(node);
            }
            linkedList.addNodes(nodes);
            return parsed_sightData;
        } else {
            throw Error('Network response was not ok.');
        }
    } catch (message) {
        console.log(`${message}`);
        throw Error('Fetching was not ok!!.');
    }
}

function plugInfo(info){
    let name = document.querySelector('.sight-name');
    let cate_met = document.querySelector('.type-mrt');
    let descrip = document.querySelector('.description');
    let address = document.querySelector('.address-info');
    let transport = document.querySelector('.transport-info');
    name.appendChild(document.createTextNode(info.sight_name));
    let category_mrt = document.createTextNode(info.sight_category+' at '+info.mrt);
    cate_met.appendChild(category_mrt);
    descrip.appendChild(document.createTextNode(info.description));
    address.appendChild(document.createTextNode(info.address));
    transport.appendChild(document.createTextNode(info.transport));
}

//選擇不同半天價錢會變
function changeFee(){
    let fee = document.getElementById('tour-fee');
    let fee_text = fee.firstChild;
    let morning = document.getElementById("choice1");
    let afternoon = document.getElementById("choice2");
    if(morning.checked){
        if(fee_text!=="新台幣 2000 元"){
            fee.firstChild.remove();
            fee.appendChild(document.createTextNode("新台幣 2000 元"));
        }    
    }else if(afternoon.checked){
        if(fee_text!=="新台幣 2500 元"){
            fee.firstChild.remove();
            fee.appendChild(document.createTextNode("新台幣 2500 元"));
        }
    }
}






function init_carousel() {
    let url = window.location.href;
    let id = url.split('/')[url.split('/').length-1];
    let promise = getData(id);
    promise.then((result) => {
        //把第一張圖塞到輪播框裡
        let track = document.getElementsByClassName("carousel__track")[0];
        currentNode = linkedList.head;
        currentNode.self.classList.add("current-slide");
        track.appendChild(currentNode.self);
        //加入圖片下方小圈圈
        let nav = document.querySelector('.carousel__nav');
        //先加第一顆圈圈,有屬性current-indicator
        let circle = document.createElement('div');
        circle.classList.add("carousel__indicator");
        circle.classList.add("current-indicator");
        nav.appendChild(circle);
        // 再加入剩下的圈圈
        for (let i = 1; i < result.data.image.length; i++) {
            let circle = document.createElement('div');
            circle.className = "carousel__indicator";
            nav.appendChild(circle);
        }
        //塞所有景點資訊
        let info = {
            sight_name : result.data.name,
            sight_category : result.data.category,
            mrt : result.data.mrt,
            description : result.data.description,
            transport : result.data.transport,
            address : result.data.address,
        } 
        plugInfo(info);

    }).catch((e) => {
        console.log(e)
    });
    //按台北一日遊回首頁
    let header = document.querySelector('.header-1');
    header.addEventListener('click',()=>{
        window.location.href = '/';
    })
    //選上半天下半天價錢會變
    let morning = document.getElementById("choice1");
    let afternoon = document.getElementById("choice2");
    morning.addEventListener('click',changeFee);
    afternoon.addEventListener('click',changeFee);
    //按下"開始預定行程"的處理事件
    let start_booking = document.getElementById("book-btn");
    start_booking.addEventListener("click",submitBooking);
    

}




//要去提交行程資料前頁面前要先驗證JWT
async function validateJWTbeforeBooking(jwt,schedule_data){
    try{
        let response = await fetch('/api/booking',{
                                     method: 'post',
                                     body: schedule_data,
                                     headers: {"Authorization" : `Bearer ${jwt}`,'Content-Type': 'application/json'}
                                    });
        let result = await response.json();                            
        if(response.ok){
            //如果新增行程ok,轉到booking頁面
            window.location.href = '/booking';
        }else if (response.status === 403){
            console.log('JWT已失效,請重新登入');
            localStorage.removeItem("JWT");
            window.location.reload();
        }else{
            console.log('伺服器錯誤');
        }
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
} 

function confirmDateandTime(){
    //先確認日期和時間都有選
    let form = document.querySelector(".schedule-form");
    let message = document.querySelector(".submit-message")
    if(message){
        form.removeChild(message)
    }
    let morning = document.getElementById("choice1");
    let afternoon = document.getElementById("choice2");
    let date = document.getElementById("date");
    let start_booking = document.getElementById("book-btn");
    let div = document.createElement("div");
    div.classList.add("submit-message");
    div.style.color = "#448899";
    //日期部分
    let choose_date = new Date(date.value); //選擇的日期
    const choose_date_unixtimestamp = Math.floor(choose_date.getTime() / 1000);
    let today = new Date();  //當日
    const current_unixtimestamp = Math.floor(today.getTime() / 1000);
    if((!date.value) || (!morning.checked && !afternoon.checked)){
        //在開始預定行程下方加上訊息
        div.appendChild(document.createTextNode("請確認日期與時間皆有選擇"));
        start_booking.after(div);
        return null;
    }else if(choose_date_unixtimestamp <= current_unixtimestamp){
        div.appendChild(document.createTextNode("請選擇晚於今天的日期"));
        start_booking.after(div);
        return null
    }else{  //沒問題才送出預定行程ajax request
        return true
    }
}


//取得表單資料
function organizeScheduleData(){
    let formdata = new FormData(document.querySelector('.schedule-form'));
    let schedule_data={}
    for(let pair of formdata.entries()){
        schedule_data[pair[0]]=pair[1]
    }
    if(schedule_data.time==="morning"){
        schedule_data["price"] = 2000
    }else{
        schedule_data["price"] = 2500
    }
    let url = window.location.href;
    let id = url.split('/')[url.split('/').length-1];
    schedule_data["attractionId"] = Number(id);
    schedule_data = JSON.stringify(schedule_data); //{"date":"2022-03-25","time":"afternoon","price":2500,"attractionId":3}
    return schedule_data
}




function submitBooking(e){
    e.preventDefault();
    //首先第一件事,檢查有無登入
    let jwt = localStorage.getItem("JWT");
    if(jwt){
        check_result = confirmDateandTime();
        if(check_result){
            let schedule_data = organizeScheduleData()
            console.log(schedule_data)
            validateJWTbeforeBooking(jwt,schedule_data);
        }    
    }else{ //如果沒有jwt,代表還沒登入,show出登入框
        let bg = showBox(sign.signIn,true,createBack());
        document.body.appendChild(bg);
        pleaseSignIn();
    }
}



window.addEventListener('load', init_carousel);


rightButton.addEventListener('click', function () {
    //圖片部分
    let track = document.querySelector('.carousel__track');
    let currentSlide = document.querySelector('.current-slide');
    track.removeChild(currentSlide);
    currentNode.self.classList.remove("current-slide");
    currentNode = currentNode.next; //下一張
    currentNode.self.classList.add("current-slide");
    track.appendChild(currentNode.self);
    //點點部分
    let nav = document.querySelector('.carousel__nav');
    let dot = document.querySelector('.current-indicator');
    dot.classList.remove('current-indicator');
    let next_dot = dot.nextElementSibling;
    if (next_dot) {
        next_dot.classList.add('current-indicator');
    } else {
        nav.children[0].classList.add('current-indicator');
    }

});

leftButton.addEventListener('click', function () {
    let track = document.querySelector('.carousel__track');
    let currentSlide = document.querySelector('.current-slide');
    track.removeChild(currentSlide);
    currentNode.self.classList.remove("current-slide");
    currentNode = currentNode.prev; //前一張
    currentNode.self.classList.add("current-slide");
    track.appendChild(currentNode.self);
    //點點部分
    let nav = document.querySelector('.carousel__nav');
    let dot = document.querySelector('.current-indicator');
    dot.classList.remove('current-indicator');
    let prev_dot = dot.previousElementSibling;
    if (prev_dot) {
        prev_dot.classList.add('current-indicator');
    } else {
        nav.children[nav.children.length - 1].classList.add('current-indicator');
    }
});