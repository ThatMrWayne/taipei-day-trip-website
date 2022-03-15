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

function init_sign(){
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



window.addEventListener('load',init_sign);