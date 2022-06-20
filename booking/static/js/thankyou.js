//render thankyou page function
function renderOrderResult(flag,network_problem){ //sign.js line 422
    if(flag){ //if true then render member's info,call api/order/orderNumber
        let url = window.location.href;
        let order_id = Number(url.split('=')[url.split('=').length-1]);
        if(order_id){
            let jwt = localStorage.getItem("JWT");    
            let promise = getOrderInfo(jwt,order_id);
            promise.then((result)=>{ 
                if(result){ 
                    let container = document.querySelector('.order-result');
                    let div1 = document.createElement('div');
                    div1.classList.add('thankyou');
                    div1.appendChild(document.createTextNode("付款成功，感謝您的訂購"));
                    let div2 = document.createElement('div');
                    div2.classList.add('thankyou');
                    div2.appendChild(document.createTextNode(`您的訂單編號為:${result.data.number}`));
                    let div3 = document.createElement('div');
                    div3.classList.add('thankyou');
                    div3.appendChild(document.createTextNode("請記住此訂單編號，以便查詢訂單"));
                    let div4 = document.createElement('div');
                    div4.classList.add('thankyou');
                    div4.appendChild(document.createTextNode("感謝您～"));
                    let divs=[div1,div2,div3,div4];
                    for(let i=0;i<4;i++){
                        container.appendChild(divs[i])
                    };
                }else{ //no order,back to index
                    setTimeout(function(){
                        window.location.href = '/';
                    },1000); 
                }    
            }).catch((message)=>{
                console.log(message);
            })  
        }else{ //order_id is not a number
                setTimeout(function(){
                window.location.href = '/';
            },1000);    
        }      
    }else{ 
        let section2 = document.querySelector(".section-2");
        let child = document.querySelector('.order-result-container');
        section2.removeChild(child);
        section2.style["padding-top"]="20px";
        if(network_problem){
            section2.appendChild(document.createTextNode("不好意思載入頁面時發生錯誤"));
        }else{
            section2.appendChild(document.createTextNode("您好，請先登入，即將導回首頁"));
        }    
    }
}


//call api to get order info
async function getOrderInfo(jwt,order_id){
    try{
        let response = await fetch(`/api/order/${order_id}`,{
                                     method: 'get',
                                     headers: {"Authorization" : `Bearer ${jwt}`}
                                    });
        let result = await response.json();                            
        if(response.ok){
            if(result.data!==null){
                return result
            }else{
                return null
            }  
        }else if (response.status === 403){
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