let global_sight_data=[]; //一開始全域景點資料是空的
let keyword_data=[];
let next_page = 0; //一開始next page就是第0頁
let keyword_next_page=null;
let amount_of_pic = 0;
let amount_of_key_pic = 0;
let scroll_by_keyword = false;
let current_keyword=null;
let scrolling=false;

//依頁數取得景點資料
async function getSightData(page){
    try{
        let url = `/api/attractions?page=${page}`
        let sightData = await fetch(url);
        if(sightData.ok){ //檢查是否為200
            let parsed_sightData = await sightData.json();
            //將取得的資料塞到global_sight_data
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

//依關鍵字取得景點資料
async function getSightDataKeyword(keyword_next_page,keyword){
    try{
        let url = `/api/attractions?page=${keyword_next_page}&keyword=${keyword}`;
        //console.log(url);
        let sightData = await fetch(url);
        if(sightData.ok){  //檢查是否為200
            let parsed_sightData = await sightData.json();
            //console.log(parsed_sightData);
            if(parsed_sightData.data.length!==0){
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
};

//按下景點框框時跑到景點頁面
function gotoAttraction(){
    let t3 = this.getElementsByClassName("t3")[0];
    window.location.href = '/attraction/'+t3.id;
}



function createInner(i,byKeyword){
    let data;
    //看是不是byKeyword
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
    //t3是隱藏起來的div,這個div的id屬性就是該景點的id,供之後點景點時可以抓到景點id送給路由/attraction/<id>
    let div_t3 = document.createElement('div');
    div_t3.className="t3";
    div_t3.id=String(data[i].id);
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
    div_txt.appendChild(div_t3);
    div_inner.appendChild(div_mark);
    div_inner.appendChild(div_txt);
    //給inner加上事件:按景點的框框事件跑到/attraction/<id>
    div_inner.addEventListener('click',gotoAttraction);
    return div_inner;
};


function handleScroll(){
        //看是不是在關鍵字搜尋下滑動
        if(! scroll_by_keyword){
            if(next_page && !scrolling){
                scrolling = true;
                let start_index = next_page*12;
                let promise = getSightData(next_page);
                promise.then((result)=>{
                    amount_of_pic=global_sight_data.length;
                    next_page=result["nextPage"];
                    scrolling = false;
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
            if(keyword_next_page && !scrolling ){
                let start_index = keyword_next_page*12;
                let promise = getSightDataKeyword(keyword_next_page,current_keyword);
                promise.then((result)=>{
                    amount_of_key_pic=keyword_data.length;
                    keyword_next_page=result["nextPage"];
                    scrolling = false;
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
        let key_page = 0;
        let promise = getSightDataKeyword(key_page,keyword);
        promise.then((result)=>{
            //如果回傳是"沒有符合的結果"
            if(typeof(result) === 'string'){
                console.log(result);
                let outer = document.getElementById("out");
                //把圖片區都移除
                while(outer.firstChild){
                    outer.removeChild(outer.firstChild)
                };
                let msg = document.createTextNode(result);
                outer.appendChild(msg);
                scroll_by_keyword = true;
                keyword_next_page=null;
            }else{
                console.log(result);
                current_keyword = keyword;
                //console.log(keyword);
                scroll_by_keyword = true;
                amount_of_key_pic = keyword_data.length;
                keyword_next_page = result["nextPage"];  
                //console.log(typeof(keyword_next_page));
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


//初始化
function init(){
    //先拿第一頁的資料(page=0)
    let promise = getSightData(next_page);
        promise.then((result)=>{
            amount_of_pic=global_sight_data.length;
            //更新下一頁
            next_page=result["nextPage"];
            for(let i =0 ; i<amount_of_pic;i++){
                let outer = document.getElementById("out");
                //塞inner元素
                outer.appendChild(createInner(i,false));        
            }
        }).catch((message)=>{
            console.log(message);
        }); 

    //滾動事件:檢查是否滾動到頁面底部  
    window.addEventListener('scroll',function(){
         if(document.documentElement.scrollTop+window.innerHeight-60==document.body.scrollHeight){
             //是的話scrolling設成true
             //scrolling=true
             handleScroll();
           };
        }
    );
    //如果滾動到底部,每一秒檢查一次,再打API
    //window.setInterval(()=>{
    //    if(scrolling){
    //        scrolling = false;
    //        handleScroll();
    //    }
    //},1000);     
    //依關鍵字搜尋景點註冊事件
    let btn = document.getElementById('btn');
    btn.addEventListener('click',sendRequest);
    //按台北一日遊回首頁    
    //let header = document.querySelector('.header-1');
    //header.addEventListener('click',()=>{
    //    window.location.href = '/';
    //})
};




window.addEventListener('load',init);