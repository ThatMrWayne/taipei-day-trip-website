let global_sight_data=[];
let keyword_data=[];
let next_page = 0;
let keyword_next_page=null;
let amount_of_pic = 0;
let amount_of_key_pic = 0;
let scroll_by_keyword = false;
let current_keyword=null;


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
    let div_t1 = document.createElement('div');
    let div_t2 = document.createElement('div');
    div_t1.className="t1";
    div_t2.className="t2";
    let name = document.createTextNode(data[i].name);
    div_t1.appendChild(name);
    let span1 = document.createElement('span');
    let span2 = document.createElement('span');
    if(data[i].mrt){
        let mrt = document.createTextNode(data[i].mrt);
        span1.appendChild(mrt);
    }  
    let cate= document.createTextNode(data[i].category.replace(/\s+/g,''));
    span2.appendChild(cate);
    div_t2.appendChild(span1);
    div_t2.appendChild(span2);
    div_txt.appendChild(div_t1);
    div_txt.appendChild(div_t2);
    div_inner.appendChild(div_mark);
    div_inner.appendChild(div_txt);
    return div_inner;
}
function handleScroll(){
    if(document.documentElement.scrollTop+window.innerHeight-60==document.body.scrollHeight){
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
    window.addEventListener('scroll',handleScroll);     
    let btn = document.getElementById('btn');
    btn.addEventListener('click',sendRequest);
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


window.addEventListener('load',init);