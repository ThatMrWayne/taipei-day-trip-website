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


//登入註冊訊息
function showMessage(msg,flag,signup_result){
    if(flag){
        let button = document.getElementById("signbtn");
        let signin_content = document.querySelector(".content");
        let previous_message_div = document.querySelector(".message");
        if (previous_message_div){
            signin_content.removeChild(previous_message_div);
        };
        let fail_div  = document.createElement("div");
        fail_div.appendChild(document.createTextNode(msg));
        fail_div.classList.add('message');
        signin_content.style.height = "270px";
        button.after(fail_div);    
    }else{
        if(signup_result){
            let button = document.getElementById("signbtn");
            let signup_content = document.querySelector(".content");
            let previous_message_div = document.querySelector(".message");
            if (previous_message_div){
                signup_content.removeChild(previous_message_div);
            };
            let succeed_div  = document.createElement("div");
            succeed_div.appendChild(document.createTextNode(msg));
            succeed_div.classList.add('message');
            signup_content.style.height = "325px";
            button.after(succeed_div);
        }else{
            let button = document.getElementById("signbtn");
            let signup_content = document.querySelector(".content");
            let previous_message_div = document.querySelector(".message");
            if (previous_message_div){
                signup_content.removeChild(previous_message_div);
            };
            let fail_div  = document.createElement("div");
            fail_div.appendChild(document.createTextNode(msg));
            fail_div.classList.add('message');
            signup_content.style.height = "325px";
            button.after(fail_div);    
        }      
    }    
}


function closeBox(){
    document.body.classList.toggle("stop-scrolling");
    let bg = document.getElementsByClassName('bg');
    document.body.removeChild(bg[0]);
};


function switchBox(flag){ 
    let bg = document.getElementsByClassName('bg')[0];
    //flag true means having account,false means not
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
    document.body.classList.toggle("stop-scrolling");
    let background = document.createElement("div");
    background.className = "bg";
    return background;
};


async function sendAuthSignUp(data){
    try{
        let response = await fetch('/api/user',{
                                     method: 'post',
                                     body: data,
                                     headers: { 'Content-Type': 'application/json'}
                                        });
        let result = await response.json();                                
        if(response.ok){ 
                showMessage("註冊成功，請登入",false,true);           
        }else if(response.status === 400){ //1.email repeat 2.email or password format wrong
            showMessage(result.message,false,false);
            let mail_input = document.querySelector('.email');
            let pass_input = document.querySelector('.pass');
            mail_input.value='';
            pass_input.value=''; 
        }else if(response.status === 500){ 
            showMessage(result.message,false,false);
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
}


async function handleSignOut(){
    try{
        let response = await fetch('/api/user',{method: 'delete'});
        let result = await response.json();    
        console.log(result);                            
        if(response.ok){ 
               localStorage.removeItem('JWT');
               window.location.reload();
        }
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
}


async function sendAuthSignIn(data){
    try{
        let response = await fetch('/api/user',{
                                     method: 'PATCH',
                                     body: data,
                                     headers: { 'Content-Type': 'application/json'}
                                        });
        let result = await response.json();                                
        if(response.ok){  
                //fetchresponse headers object(iterable object)
                let test = [];
                response.headers.forEach(function(o){test.push(o)});
                localStorage.setItem('JWT',test[0]);
                closeBox();
                window.location.reload();
        }else if(response.status === 400){ //1.wrong password 2.no this member
                showMessage(result.message,true,null)
                let mail_input = document.querySelector('.email');
                let pass_input = document.querySelector('.pass');
                mail_input.value='';
                pass_input.value=''; 
        }else if(response.status === 500){ 
                showMessage(result.message,true,null)
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
}



function handleSignUp(){
    let email = document.querySelector('.email').value;
    let password = document.querySelector('.pass').value;
    let name = document.querySelector('.name').value;
    if ((!name||!email) || (!password)){
        showMessage('請確實填寫註冊資訊欄位',false,false);
    }else{
        let emailRegex = /^(?!\.{1,2})(?![^\.]*\.{2})(?!.*\.{2}@)(?=[a-zA-Z0-9\.!#\$%&\'\*\+\/=?\^_{\|}~-]+@{1}(?:[A-Za-z\d]+\.{1})+[a-zA-Z]+$)(?!.*@{2,}).*/g;
        let passwordRegex = /^(?=\w{8,16}$)(?=(?:[^A-Z]*[A-Z]){3})(?=[^a-z]*[a-z])(?=[^\d]*\d).*/g;
        if(emailRegex.test(email)&&passwordRegex.test(password)){
            let data = {  
                "name":name,
                "email":email,
                "password":password,
            }
            let req = JSON.stringify(data); 
            sendAuthSignUp(req);
        }else{
            let button = document.getElementById("signbtn");
            let signup_content = document.querySelector(".content");
            let previous_message_div = document.querySelector(".message");
            if (previous_message_div){
                signup_content.removeChild(previous_message_div);
            };
            let fail_div  = document.createElement("div");
            let span = document.createElement("span");
            span.appendChild(document.createTextNode("信箱或密碼輸入有誤。您的密碼必須包含:"));
            conditions=["八至十六個字元(僅限英文字母/數字)","至少三個大寫英文字母","至少一個小寫英文字母","至少一個阿拉伯數字"]
            condition_ul_tag = document.createElement("ul");
            condition_ul_tag.classList.add("condition");
            for(let i = 0;i<conditions.length;i++){
                let li = document.createElement("li");
                li.appendChild(document.createTextNode(conditions[i]));
                condition_ul_tag.appendChild(li);
            }; 
            fail_div.appendChild(span);
            fail_div.appendChild(condition_ul_tag);
            fail_div.classList.add('message');
            signup_content.style.height = "410px";
            button.after(fail_div);       
            //清空信箱和密碼輸入框
            let mail_input = document.querySelector('.email');
            let pass_input = document.querySelector('.pass');
            mail_input.value='';
            pass_input.value=''; 
        };
    };
};


function handleSignIn(){
    let email = document.querySelector('.email').value;
    let password = document.querySelector('.pass').value;
    if (!email || !password){
        showMessage('請確實填寫登入資訊',true,null)
    }else{
        let data = {
            'email':email,
            'password':password,
        }
        let req = JSON.stringify(data); //轉成json格式
        sendAuthSignIn(req);
    }    
}



function showBox(obj,flag,background){//flag true meaning having account
    let sign_box = document.createElement("div");
    sign_box.className=obj.box //"signinbox signupbox";
    let small_head = document.createElement('div');
    small_head.className = "strip";
    sign_box.appendChild(small_head);
    let sign_content = document.createElement("div");
    sign_content.className = "content";
    if(flag){
        sign_content.style.height="250px";
    }else{
        sign_content.style.height="307px";
    }
    let head = document.createElement("div");
    head.className = "head";
    let head_text = document.createTextNode(obj.head_txt);
    head.appendChild(head_text);
    sign_content.appendChild(head);
    let img = new Image();
    img.src = "/static/icon_close.png";
    img.className="icon-close";
    img.addEventListener('click',closeBox);
    head.appendChild(img);
    //check signin or signup (signin true, signup false)
    if(!flag){
        let input_name = document.createElement("input");
        input_name.className = "name";
        input_name.setAttribute("placeholder","輸入姓名");
        input_name.setAttribute("type","text");
        sign_content.appendChild(input_name);
    }
    let input_mail = document.createElement("input");
    input_mail.className = "email";
    input_mail.setAttribute("placeholder",obj.mail_txt);
    input_mail.setAttribute("type","text");
    sign_content.appendChild(input_mail);
    let input_pass = document.createElement("input");
    input_pass.className = "pass";
    input_pass.setAttribute("placeholder","輸入密碼");
    input_pass.setAttribute("type","password");
    sign_content.appendChild(input_pass);
    let button = document.createElement("div");
    button.setAttribute("id","signbtn");   
    let button_text = document.createTextNode(obj.btn_txt);
    button.appendChild(button_text);
    if(flag){
        button.addEventListener('click',function(){handleSignIn()})
    }else{
        button.addEventListener('click',function(){handleSignUp()})
    };
    sign_content.appendChild(button);
    let goto = document.createElement("div");
    goto.className = obj.destination;
    let goto_text = document.createTextNode(obj.msg);
    goto.appendChild(goto_text);
    goto.addEventListener("click",function(){
                          switchBox(!flag)
                        });
    sign_content.appendChild(goto);
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
        if(response.ok){
            if(result.data!==null){
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
                mailBox.setAttribute("user-name",result.data.name);
                mailBox.appendChild(document.createTextNode(`${result.data.email}`));
                let logoutBtn = document.createElement('div');
                logoutBtn.id="logout";
                logoutBtn.appendChild(document.createTextNode("登出"));
                logoutBtn.addEventListener('click',handleSignOut);
                dropdownBox.appendChild(mailBox);
                dropdownBox.appendChild(logoutBtn);
                login.appendChild(dropdownBox);
                return true;
            }else{
                localStorage.removeItem("JWT");
                window.location.replace('/');
            }
        }else{
            localStorage.removeItem("JWT");
            window.location.replace('/');
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
} 


//初始化登入,註冊鈕
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
    login_btn.addEventListener('click',function(){
        let bg = showBox(sign.signIn,true,createBack());
        document.body.appendChild(bg);
    });
    signup_btn.addEventListener('click',function(){
        let bg = showBox(sign.signUp,false,createBack());
        document.body.appendChild(bg);
    });    
    login.appendChild(login_btn);
    login.appendChild(span2);
    login.appendChild(signup_btn);
}


function init_sign(){  
    let header = document.querySelector('.header-1');
    header.addEventListener('click',()=>{
        window.location.href = '/';});
    
    let jwt = localStorage.getItem("JWT");
    if(jwt){ 
        let promise = sendJWT(jwt);
        let path = window.location.href.split('/')
        if(path.includes("booking")){
            promise.then((result)=>{
                if(result){
                    //jwt pass,render user's booking schedule
                    renderUserSchedule(true); //in booking.js
                }
            }).catch(()=>{
                renderUserSchedule(false,true); //in booking.js
            });
        }else{
            promise.then((result)=>{
                if(result){
                    //jwt pass,render user's prder
                    renderOrderResult(true); //in thankyou.js
                }
            }).catch(()=>{
                renderOrderResult(false,true); //in thankyou.js
            }); 
        }
    }else{  
        init_sign_without_jwt();  
        //no jwt,render page to signin first (booking and thankyou page)
        let path = window.location.href.split('/')
        if( path.includes("booking")){
            renderUserSchedule(false,false); //in booking.js
            setTimeout(function(){
                window.location.href = '/';
            },1000);
        }else if (path.includes("thankyou")){
            renderOrderResult(false,false); //in thankyou.js
            setTimeout(function(){
                window.location.href = '/';
            },1000);
        }
    };
}    


//before into jwt
async function validateJWT(jwt){
    try{
        let response = await fetch('/api/user',{
                                     method: 'get',
                                     headers: {"Authorization" : `Bearer ${jwt}`}
                                    });
        let result = await response.json();                            
        if(response.ok){
            if(result.data!==null){
               window.location.href="/booking";
            }else{
                localStorage.removeItem("JWT");
                window.location.replace('/');
            }
        }else{
            localStorage.removeItem("JWT");
            window.location.replace('/');
        };
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
} 


function pleaseSignIn(){
    let button = document.getElementById("signbtn");
    let signin_content = document.querySelector(".content");
    let message_div  = document.createElement("div");
    message_div.appendChild(document.createTextNode("請先登入"));
    message_div.classList.add('message');
    signin_content.style.height = "270px";
    button.after(message_div);      
}



function handleBooking(){
    let jwt = localStorage.getItem("JWT");
    if(jwt){
        validateJWT(jwt);
    }else{
        let bg = showBox(sign.signIn,true,createBack());
        document.body.appendChild(bg);
        pleaseSignIn();
    }
}

//"預定行程"event
function init_booking(){
    let booking_schedule = document.querySelector(".schedule");
    booking_schedule.addEventListener("click",handleBooking);
}



window.addEventListener('load',init_sign);
window.addEventListener("load",init_booking);

