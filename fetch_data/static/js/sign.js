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
    //flag true代表有帳戶,false沒有帳戶
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

//處理送出註冊資訊
async function sendAuthSignUp(data){
    try{
        let response = await fetch('/api/user',{
                                     method: 'post',
                                     body: data,
                                     headers: { 'Content-Type': 'application/json'}
                                        });
        let result = await response.json();                                
        if(response.ok){ //200情況下 
               alert('註冊成功,請登入') ;
               //讓畫面轉到登入畫面
               switchBox(true);
        }else if(response.status === 400){ //如果是400,有可能是1.email重複 2.註冊信箱或密碼格式錯誤
            alert(result.message)
            //清空信箱和密碼輸入框
            let mail_input = document.querySelector('.email');
            let pass_input = document.querySelector('.pass');
            mail_input.value='';
            pass_input.value=''; 
        }else if(response.status === 500){ //如果是500,代表伺服器(資料庫)內部錯誤
            alert(result.message)
            closeBox();
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
}

//處理登出事件 假設登出回到首頁
async function handleSignOut(){
    try{
        let response = await fetch('/api/user',{method: 'delete'});
        let result = await response.json();    
        console.log(result);                            
        if(response.ok){ //200情況下 
               console.log('登出成功') ;
               localStorage.removeItem('JWT');
               window.location.reload('/')
        }
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
}



//處理送出登入資訊
async function sendAuthSignIn(data){
    try{
        let response = await fetch('/api/user',{
                                     method: 'patch',
                                     body: data,
                                     headers: { 'Content-Type': 'application/json'}
                                        });
        let result = await response.json();                                
        if(response.ok){  //200情況下 
                alert('登入成功'); 
                closeBox();
                let login = document.querySelector('.login');
                while(login.firstChild){
                    login.removeChild(login.firstChild)
                }
                //右上角放小頭像
                let img  = new Image();
                img.src="/static/member.png";
                img.id = "signout";
                img.addEventListener('click',function(){
                    let drop = document.getElementById('myDropdown');
                    drop.classList.toggle('show-dropdown');
                });
                login.appendChild(img);
                //下拉選單
                let dropdownBox = document.createElement('div');
                dropdownBox.classList.add("dropdown-content");
                dropdownBox.id="myDropdown";
                let mailBox = document.createElement('div');
                mailBox.id = "user-email";
                const email = JSON.parse(data).email;
                mailBox.appendChild(document.createTextNode(`${email}`));
                let logoutBtn = document.createElement('div');
                logoutBtn.id="logout";
                logoutBtn.appendChild(document.createTextNode("登出"));
                logoutBtn.addEventListener('click',handleSignOut);
                dropdownBox.appendChild(mailBox);
                dropdownBox.appendChild(logoutBtn);
                login.appendChild(dropdownBox);
                //把登入成功得到的JWT 存在local storage,這邊要注意的是,fetch回來的response headers object
                //是iterable 物件,無法直接像plain object取得裡面的東西,要用迭代的方式取得
                let test = [];
                response.headers.forEach(function(o){test.push(o)});
                localStorage.setItem('JWT',test[0]);
        }else if(response.status === 400){ //代表1.密碼錯誤2.沒有此信箱會員
                alert(result.message) ;
                let mail_input = document.querySelector('.email');
                let pass_input = document.querySelector('.pass');
                mail_input.value='';
                pass_input.value=''; 
        }else if(response.status === 500){ //如果是500,代表伺服器(資料庫)內部錯誤
                alert(result.message)
                closeBox();
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    

}


//處理註冊事件
function handleSignUp(){
    let email = document.querySelector('.email').value;
    let password = document.querySelector('.pass').value;
    let name = document.querySelector('.name').value;
    //先在前端驗證看看有沒有確實輸入或輸入正不正確
    if ((!name||!email) || (!password)){
        alert('請確實填寫註冊資訊欄位')
    }else{
        let emailRegex = /^(?!\.{1,2})(?![^\.]*\.{2})(?!.*\.{2}@)(?=[a-zA-Z0-9\.!#\$%&\'\*\+\/=?\^_{\|}~-]+@{1}(?:[A-Za-z\d]+\.{1})+[a-zA-Z]+$)(?!.*@{2,}).*/g;
        let passwordRegex = /^(?=\w{8,16}$)(?=(?:[^A-Z]*[A-Z]){3})(?=[^a-z]*[a-z])(?=[^\d]*\d).*/g;
        //檢查看格式正不正確
        if(emailRegex.test(email)&&passwordRegex.test(password)){
            let data = {  //註冊資訊
                "name":name,
                "email":email,
                "password":password,
            }
            let req = JSON.stringify(data); //將註冊資料轉成json格式
            sendAuthSignUp(req);
        }else{
            alert('信箱或密碼輸入有誤，請重新輸入\n您的密碼必須包含:\n八至十六個字元(僅限英文字母/數字)\n至少三個大寫英文字母\n至少一個小寫英文字母\n至少一個阿拉伯數字');
            //清空信箱和密碼輸入框
            let mail_input = document.querySelector('.email');
            let pass_input = document.querySelector('.pass');
            mail_input.value='';
            pass_input.value=''; 
        };
    };
}


//處理登入事件
function handleSignIn(){
    let email = document.querySelector('.email').value;
    let password = document.querySelector('.pass').value;
    if (!email || !password){
        alert('請確實填寫登入資訊')
    }else{
        let data = {
            'email':email,
            'password':password,
        }
        let req = JSON.stringify(data); //轉成json格式
        sendAuthSignIn(req);
    }    

}


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
    //不管是登入或註冊鈕,在創造出來的時候,就要加上eventlistener,目的是送出ajax到後端驗證的路由
    if(flag){
        button.addEventListener('click',function(){handleSignIn()})
    }else{
        button.addEventListener('click',function(){handleSignUp()})
    };
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



async function sendJWT(jwt){
    try{
        let response = await fetch('/api/user',{
                                     method: 'get',
                                     headers: {"Authorization" : `Bearer ${jwt}`}
                                    });
        let result = await response.json();       
        console.log(result)                     
        if(response.ok){
            if(result.data!==null){
                //右上角放小頭像
                let login = document.querySelector('.login');
                let img  = new Image();
                img.src="/static/member.png";
                img.id = "signout";
                img.addEventListener('click',function(){
                    let drop = document.getElementById('myDropdown');
                    drop.classList.toggle('show-dropdown');
                });
                login.appendChild(img);
                //下拉選單
                let dropdownBox = document.createElement('div');
                dropdownBox.classList.add("dropdown-content");
                dropdownBox.id="myDropdown";
                let mailBox = document.createElement('div');
                mailBox.id = "user-email";
                mailBox.appendChild(document.createTextNode(`${result.data.email}`));
                let logoutBtn = document.createElement('div');
                logoutBtn.id="logout";
                logoutBtn.appendChild(document.createTextNode("登出"));
                logoutBtn.addEventListener('click',handleSignOut);
                dropdownBox.appendChild(mailBox);
                dropdownBox.appendChild(logoutBtn);
                login.appendChild(dropdownBox);
            }else{
                console.log('JWT已經失效');
                localStorage.removeItem("JWT");
                window.location.replace('/');
            }
        }else{
            console.log('有錯誤喔');
            localStorage.removeItem("JWT");
            window.location.replace('/');
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
} 


//初始化預定行程,登入,註冊鈕
function init_sign_without_jwt(){
    let login = document.querySelector(".login");
    let login_btn = document.createElement("span");
    login_btn.id="signin";
    login_btn.appendChild(document.createTextNode("登入"));
    let span2 = document.createElement("span");
    span2.appendChild(document.createTextNode("/"));
    let signup_btn = document.createElement("span");
    signup_btn.id="signup";
    signup_btn.appendChild(document.createTextNode("註冊"));
    //按下登入事件
    login_btn.addEventListener('click',function(){
        let bg = showBox(sign.signIn,true,createBack());
        document.body.appendChild(bg);
    });
     //按下註冊事件
    signup_btn.addEventListener('click',function(){
        let bg = showBox(sign.signUp,false,createBack());
        document.body.appendChild(bg);
    });    
    login.appendChild(login_btn);
    login.appendChild(span2);
    login.appendChild(signup_btn);
}


function init_sign(){
    let jwt = localStorage.getItem("JWT");
    if(jwt){ //如果已經有jwt,加在header上送出request
        sendJWT(jwt)
    }else{  
        init_sign_without_jwt();  
    };
}    


window.addEventListener('load',init_sign);