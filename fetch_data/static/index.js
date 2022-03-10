let global_sight_data=[];
let keyword_data=[];
let next_page = 0;
let keyword_next_page=null;
let amount_of_pic = 0;
let amount_of_key_pic = 0;
let scroll_by_keyword = false;
let current_keyword=null;
let sign = {
    'signIn':{
        "box":"signinbox",
        "head_txt":"登入會員帳號",
        "mail_txt":"輸入電子信箱",
        "btn_txt":"登入帳戶",
        "destination":"tosignup",
        "msg":"還沒有帳戶?點此註冊"
    },
    'signUp':{
        "box":"signupbox",
        "head_txt":"註冊會員帳號",
        "mail_txt":"輸入電子郵件",
        "btn_txt":"註冊帳戶",
        "destination":"tosignin",
        "msg":"已經有帳戶?點此登入"
    }
};




let scrolling=false;

async function getSightData(page){
    try{
        let url = `/api/attractions?page=${page}`
        let sightData = await fetch(url);
        if(sightData.ok){
            let parsed_sightData = await sightData.json();
            for(let i=0;i<parsed_sightData.data.length;i++){
                global_sight_data.push(parsed_sightData.data[i])
                }
            return parsed_sightData;
                    
        }else{
            throw Error('Network response was not ok.');
        }
                
    }catch(message){
        console.log(`${message}`);
        throw Error('Fetching was not ok!!.');    
        } 
}

async function getSightDataKeyword(keyword_next_page,keyword){
    try{
        let url = `/api/attractions?page=${keyword_next_page}&keyword=${keyword}`;
        console.log(url);
        let sightData = await fetch(url);
        if(sightData.ok){
            let parsed_sightData = await sightData.json();
            if(parsed_sightData.data){
                for(let i=0;i<parsed_sightData.data.length;i++){
                    keyword_data.push(parsed_sightData.data[i])
                    }   
                return parsed_sightData;
            }else{
                return "沒有符合的結果"
            }      
        }else{
            throw Error('Network response was not ok.');
        }
                
    }catch(message){
        console.log(`${message}`);
        throw Error('Fetching was not ok!!.');    
        } 
}

//為景點文字div加入屬性title,當滑鼠移上去時可以看到完整景點
function addTitle(t1){
    t1.setAttribute("title",t1.textContent);
    //console.log(t1.textContent)
};



function createInner(i,byKeyword){
    let data;
    if(!byKeyword){
        data = global_sight_data;
    }else{
        data = keyword_data;
    };    
    let div_inner = document.createElement('div');
    let div_mark = document.createElement('div');
    let div_txt = document.createElement('div');
    div_inner.className="inner";
    div_mark.className="mark";
    div_txt.className="txt";
    let img = new Image();
    img.src = data[i].images[0];
    div_mark.appendChild(img);
    //t1是景點名稱的div
    let div_t1 = document.createElement('div');
    //t2是景點資訊的div
    let div_t2 = document.createElement('div');
    div_t1.className="t1";
    div_t2.className="t2";
    //景點名稱
    let name = document.createTextNode(data[i].name);
    div_t1.appendChild(name);
    //當滑鼠移到div_t1上加入title屬性
    div_t1.addEventListener('mouseenter',function(){
                            addTitle(this)
                            });
    let span1 = document.createElement('span');
    let span2 = document.createElement('span');
    if(data[i].mrt){
        //捷運站
        let mrt = document.createTextNode(data[i].mrt);
        span1.appendChild(mrt);
    }
    //景點分類
    let cate= document.createTextNode(data[i].category.replace(/\s+/g,''));
    span2.appendChild(cate);
    div_t2.appendChild(span1);
    div_t2.appendChild(span2);
    div_txt.appendChild(div_t1);
    div_txt.appendChild(div_t2);
    div_inner.appendChild(div_mark);
    div_inner.appendChild(div_txt);
    //
    return div_inner;
}
function handleScroll(){
        if(! scroll_by_keyword){
            if(next_page){
                let start_index = next_page*12;
                let promise = getSightData(next_page);
                promise.then((result)=>{
                    amount_of_pic=global_sight_data.length;
                    next_page=result["nextPage"];
                    for(let i=start_index;i<amount_of_pic;i++){
                        let outer = document.getElementById("out");
                        outer.appendChild(createInner(i,false)); 
                    }   
                }).catch((message)=>{
                    console.log(message)
                });
            }else{
                console.log('no more sight pictures!')
            }
        }else{
            if(keyword_next_page){
                let start_index = keyword_next_page*12;
                let promise = getSightDataKeyword(keyword_next_page,current_keyword);
                promise.then((result)=>{
                    amount_of_key_pic=keyword_data.length;
                    keyword_next_page=result["nextPage"];
                    for(let i=start_index;i<amount_of_key_pic;i++){
                        let outer = document.getElementById("out");
                        outer.appendChild(createInner(i,true)); 
                    }     
                }).catch((message)=>{
                    console.log(message)
                });
            }else{
                console.log('no more sight pictures!')
            }
        };           
};

function sendRequest(){
    current_keyword = null;
    keyword_data = [];
    let input = document.getElementById('que');
    let keyword=input.value.replace(/\s+/g,'');
    if(keyword){
        let key_page = 0
        let promise = getSightDataKeyword(key_page,keyword);
        promise.then((result)=>{
            if(typeof(result) === 'string'){
                let outer = document.getElementById("out")
                while(outer.firstChild){
                    outer.removeChild(outer.firstChild)
                };
                let msg = document.createTextNode(result);
                outer.appendChild(msg);
                scroll_by_keyword = true;
                keyword_next_page=null;
            }else{
                current_keyword = keyword;
                console.log(keyword);
                scroll_by_keyword = true;
                amount_of_key_pic = keyword_data.length;
                keyword_next_page = result["nextPage"];  
                console.log(typeof(keyword_next_page));
                let outer = document.getElementById("out")
                while(outer.firstChild){
                    outer.removeChild(outer.firstChild)
                };
                for(let i=0;i<amount_of_key_pic;i++){
                    outer.appendChild(createInner(i,true)); 
                }
            }
        }).catch((message)=>{
            let outer = document.getElementById("out")
            while(outer.firstChild){
                outer.removeChild(outer.firstChild)
            };
            let msg = document.createTextNode(message);
            outer.appendChild(msg);
            console.log(message);
        });
    };    
};


function init(){
    let promise = getSightData(next_page);
        promise.then((result)=>{
            amount_of_pic=global_sight_data.length;
            next_page=result["nextPage"];
            for(let i =0 ; i<amount_of_pic;i++){
                let outer = document.getElementById("out");
                outer.appendChild(createInner(i,false));        
            }
        }).catch((message)=>{
            console.log(message);
        }); 
    //滾動事件:檢查是否滾動到頁面底部  
    window.addEventListener('scroll',function(){
         if(document.documentElement.scrollTop+window.innerHeight-60==document.body.scrollHeight){
             scrolling=true
           };
        }
    );
    //如果滾動到底部,每一秒檢查一次,再打API
    window.setInterval(()=>{
        if(scrolling){
            scrolling = false;
            handleScroll();
        }
    },1000);     
    //依關鍵字搜尋景點註冊事件
    let btn = document.getElementById('btn');
    btn.addEventListener('click',sendRequest);
    //按下登入事件
    let login_btn = document.getElementById("signin");
    login_btn.addEventListener('click',function(){
        let bg = showBox(sign.signIn,true,createBack());
        document.body.appendChild(bg);
    });
    //按下註冊事件
    let signup_btn = document.getElementById("signup");
    signup_btn.addEventListener('click',function(){
        let bg = showBox(sign.signUp,false,createBack());
        document.body.appendChild(bg);
    });
};

//關掉框框
function closeBox(){
    document.body.classList.toggle("stop-scrolling");
    let bg = document.getElementsByClassName('bg');
    document.body.removeChild(bg[0]);
};

//框框互換
function switchBox(flag){
    let bg = document.getElementsByClassName('bg')[0];
    if(flag){
        let box = document.getElementsByClassName("signupbox")[0];
        bg.removeChild(box);
        showBox(sign.signIn,true,bg);
    }else{
        let box = document.getElementsByClassName("signinbox")[0];
        bg.removeChild(box);
        showBox(sign.signUp,false,bg);
    }
};

function createBack(){
    //讓頁面無法滑動
    document.body.classList.toggle("stop-scrolling");
    //創造背景
    let background = document.createElement("div");
    background.className = "bg";
    return background;
};


//show出登入/註冊框
function showBox(obj,flag,background){//flag true代表有帳戶,false沒有帳戶
    //主要框框
    let sign_box = document.createElement("div");
    sign_box.className=obj.box //"signinbox signupbox";
    //小彩條
    let small_head = document.createElement('div');
    small_head.className = "strip";
    sign_box.appendChild(small_head);
    //主要內容
    let sign_content = document.createElement("div");
    sign_content.className = "content";
      //看是登入還是註冊調整高度
    if(flag){
        sign_content.style.height="250px";
    }else{
        sign_content.style.height="307px";
    }
    //登入,註冊會員帳號＆x圖案
    let head = document.createElement("div");
    head.className = "head";
    let head_text = document.createTextNode(obj.head_txt);//"登入會員帳號"
    head.appendChild(head_text);
    sign_content.appendChild(head);
    let img = new Image();
    img.src = "/static/icon_close.png";
    img.className="icon-close";
    //按x關掉框框
    img.addEventListener('click',closeBox);
    head.appendChild(img);
    //判斷是登入還是註冊(登入true,註冊false),如果是false要新增一欄"輸入姓名"
    if(!flag){
        let input_name = document.createElement("input");
        input_name.className = "name";
        input_name.setAttribute("placeholder","輸入姓名");
        input_name.setAttribute("type","text");
        sign_content.appendChild(input_name);
    }
    //信箱輸入框
    let input_mail = document.createElement("input");
    input_mail.className = "email";
    input_mail.setAttribute("placeholder",obj.mail_txt);
    input_mail.setAttribute("type","text");
    sign_content.appendChild(input_mail);
    //密碼輸入框
    let input_pass = document.createElement("input");
    input_pass.className = "pass";
    input_pass.setAttribute("placeholder","輸入密碼");
    input_pass.setAttribute("type","password");
    sign_content.appendChild(input_pass);
    //登入,註冊鈕
    let button = document.createElement("div");
    button.setAttribute("id","signbtn");
    let button_text = document.createTextNode(obj.btn_txt);
    button.appendChild(button_text);
    sign_content.appendChild(button);
    //還沒有帳戶or已經有帳戶？
    let goto = document.createElement("div");
    goto.className = obj.destination;
    let goto_text = document.createTextNode(obj.msg);
    goto.appendChild(goto_text);
     //按下去換框框
    goto.addEventListener("click",function(){
                          switchBox(!flag)
                        });
    sign_content.appendChild(goto);
    //將主內容放入框框裡
    sign_box.append(sign_content);
    background.appendChild(sign_box);
    return background;
}




window.addEventListener('load',init);