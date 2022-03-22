//動態抓取使用者的預定行程顯示出來

function showUserSchedule(){
    //按台北一日遊回首頁    
    let header = document.querySelector('.header-1');
    header.addEventListener('click',()=>{
        window.location.href = '/';
    })
}


window.addEventListener("load",showUserSchedule);


function renderUserSchedule(flag,network_problem){
    if(flag){ //如果是true才要render使用者的資料
        console.log('hi');
    }else{ //如果是false,就render顯示“請先登入”或是不好意思載入頁面時發生錯誤"
        let section2 = document.querySelector(".section-2");
        let section3 = document.querySelector(".section-3");
        let pay = document.querySelector(".pay");

        let final = document.querySelector(".final-payment");
        if(network_problem){
            section2.innerHTML = "不好意思載入頁面時發生錯誤";
        }else{
            section2.innerHTML = "請先登入";
        }    
        document.body.removeChild(section3);
        document.body.removeChild(pay);
        document.body.removeChild(final);
    }
}

