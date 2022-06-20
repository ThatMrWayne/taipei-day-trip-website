
//render booking page function
function renderUserSchedule(flag,network_problem){ //sign.js line 422
    if(flag){ //if true then render member's info,call api/booking
        let jwt = localStorage.getItem("JWT");    
        let promise = getMemberTripInfo(jwt);
        promise.then((result)=>{ //use result to render 
            let user_name = document.getElementById('user-email').getAttribute("user-name");
            let hello_header = document.querySelector('.pending-sche-header');
            hello_header.appendChild(document.createTextNode(`您好，${user_name}，待預訂行程如下:`));
            if(result){ //there is booked schedule
                let pending_sche_info = document.createElement("div"); //class=pending-sche-info
                pending_sche_info.classList.add("pending-sche-info");
                let garbage = document.createElement("div"); //class=garbage
                garbage.classList.add("garbage");
                let icon_delete = new Image();
                icon_delete.src = "/static/icon_delete.png";
                garbage.appendChild(icon_delete);
                garbage.addEventListener('click',deleteTrip); //綁定刪除行程鈕
                pending_sche_info.appendChild(garbage);
                let pending_sche_photo = document.createElement("div");
                pending_sche_photo.classList.add("pending-sche-photo");
                let img = new Image();
                img.src = result.data.attraction.image;
                pending_sche_photo.appendChild(img);
                pending_sche_info.appendChild(pending_sche_photo);
                // class=pending-sche-detail
                let pending_sche_detail = document.createElement("div");
                pending_sche_detail.classList.add("pending-sche-detail");
                let span1 = document.createElement("span");
                let span2 = document.createElement("span");
                let span3 = document.createElement("span");
                let span4 = document.createElement("span");
                let span5 = document.createElement("span");
                span1.classList.add("out-span");
                span1.classList.add("small-title");
                span1.appendChild(document.createTextNode("台北一日遊 : "));
                span2.classList.add("out-span");
                span2.classList.add("small-content");
                span2.appendChild(document.createTextNode("日期 : "));
                span3.classList.add("out-span");
                span3.classList.add("small-content");
                span3.appendChild(document.createTextNode("時間 : "));
                span4.classList.add("out-span");
                span4.classList.add("small-content");
                span4.appendChild(document.createTextNode("費用 : "));
                span5.classList.add("out-span");
                span5.classList.add("small-content");
                span5.classList.add("address");
                span5.appendChild(document.createTextNode("地點 : "));
                let span1_1 = document.createElement("span");
                span1_1.id = "sight-name";
                span1_1.appendChild(document.createTextNode(`${result.data.attraction.name}`));
                span1.appendChild(span1_1);
                let span2_1 = document.createElement("span");
                span2_1.id = "booking-date";
                span2_1.appendChild(document.createTextNode(`${result.data.date}`));
                span2.appendChild(span2_1);
                let span3_1 = document.createElement("span");
                span3_1.id = "booking-time";
                if(result.data.time==="morning"){
                    span3_1.appendChild(document.createTextNode("早上9點到11點"))
                }else{
                    span3_1.appendChild(document.createTextNode("下午1點到4點"))
                }   
                span3.appendChild(span3_1);
                let span4_1 = document.createElement("span");
                span4_1.id = "booking-fee";
                span4_1.appendChild(document.createTextNode(`新台幣 ${result.data.price} 元`));
                span4.appendChild(span4_1);
                let span5_1 = document.createElement("span");
                span5_1.id = "sight-address";
                span5_1.appendChild(document.createTextNode(`${result.data.attraction.address}`));
                span5.appendChild(span5_1);
                pending_sche_detail.appendChild(span1);
                pending_sche_detail.appendChild(span2);
                pending_sche_detail.appendChild(span3);
                pending_sche_detail.appendChild(span4);
                pending_sche_detail.appendChild(span5);
                pending_sche_info.appendChild(pending_sche_detail);
                //pending-sche
                let pending_sche = document.querySelector('.pending-sche');
                pending_sche.appendChild(pending_sche_info);
                let sep1 = document.createElement("div");
                sep1.classList.add("seperate");
                let section_3 = document.createElement("div");
                section_3.classList.add("section-3");
                let contact_info_conatiner = document.createElement("div");
                contact_info_conatiner.classList.add("contact-info-conatiner");
                let contact_info = document.createElement("div");
                contact_info.classList.add("contact-info");
                contact_header = document.createElement("div");
                contact_header.classList.add("contact-header");
                contact_header.classList.add("thick-header");
                contact_header.appendChild(document.createTextNode("您的聯絡資訊"));
                contact_info.appendChild(contact_header);
                let contact_name = document.createElement("div");
                contact_name.classList.add("contact-name");
                let contact_name_span = document.createElement("span");
                contact_name_span.appendChild(document.createTextNode("聯絡姓名 : "));
                let contact_name_input = document.createElement("input");
                contact_name_input.id="contact-name";
                contact_name_input.setAttribute("type","text");
                contact_name_input.setAttribute("name","name");
                contact_name_input.value = user_name;
                contact_name.appendChild(contact_name_span);
                contact_name.appendChild(contact_name_input);
                contact_info.appendChild(contact_name);
                //email
                let contact_email = document.createElement("div");
                contact_email.classList.add("contact-email");
                let contact_email_span = document.createElement("span");
                contact_email_span.appendChild(document.createTextNode("聯絡信箱 : "));
                let contact_email_input = document.createElement("input");
                contact_email_input.id="contact-email";
                contact_email_input.setAttribute("type","text");
                contact_email_input.setAttribute("name","email");
                contact_email_input.value = document.getElementById('user-email').textContent;
                contact_email.appendChild(contact_email_span);
                contact_email.appendChild(contact_email_input);
                contact_info.appendChild(contact_email);
                //mobile number
                let contact_mobile = document.createElement("div");
                contact_mobile.classList.add("contact-mobile");
                let contact_mobile_span = document.createElement("span");
                contact_mobile_span.appendChild(document.createTextNode("手機號碼 : "));
                let contact_mobile_input = document.createElement("input");
                contact_mobile_input.id="contact-number";
                contact_mobile_input.setAttribute("type","tel");
                contact_mobile_input.setAttribute("name","phone");
                contact_mobile.appendChild(contact_mobile_span);
                contact_mobile.appendChild(contact_mobile_input);
                contact_info.appendChild(contact_mobile);
                // reminder
                let reminder = document.createElement("div");
                reminder.classList.add("reminder");
                reminder.appendChild(document.createTextNode("請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。"));
                contact_info.appendChild(reminder);
                contact_info_conatiner.appendChild( contact_info);
                section_3.appendChild(contact_info_conatiner);
                let sep2 = document.createElement("div");
                sep2.classList.add("seperate");
                //class = pay
                let pay = document.createElement("div");
                pay.classList.add("pay");
                let payment_info_container = document.createElement("div");
                payment_info_container.classList.add("payment-info-container")
                let payment_info = document.createElement("payment-info");
                payment_info.classList.add("payment-info");
                let payment_header = document.createElement("div");
                payment_header.classList.add("payment-header");
                payment_header.classList.add("thick-header");
                payment_header.appendChild(document.createTextNode("信用卡付款資訊"));
                payment_info.appendChild(payment_header);
                //card number
                let card_number_group = document.createElement("div");
                card_number_group.classList.add("form-group");
                card_number_group.classList.add("card-number-group");
                let span_card_number = document.createElement("span");
                span_card_number.appendChild(document.createTextNode("卡片號碼 : "));
                let card_type = document.createElement("span");
                card_type.id="cardtype";
                let card_number =document.createElement("div");
                card_number.classList.add("form-control");
                card_number.classList.add("card-number");
                card_number_group.appendChild(span_card_number);
                card_number_group.appendChild(card_type);
                card_number_group.appendChild(card_number);
                payment_info.appendChild(card_number_group);
                //expiration time
                let expiration_date_group = document.createElement("div");
                expiration_date_group.classList.add("form-group");
                expiration_date_group.classList.add("expiration-date-group");
                let span_expiration = document.createElement("span");
                span_expiration.appendChild(document.createTextNode("過期時間 : "));
                let expiration_date =document.createElement("div");
                expiration_date.classList.add("form-control");
                expiration_date.classList.add("expiration-date");
                expiration_date.id = "tappay-expiration-date";
                expiration_date_group.appendChild(span_expiration);
                expiration_date_group.appendChild(expiration_date);
                payment_info.appendChild(expiration_date_group);
                //verify password
                let cvc_group = document.createElement("div");
                cvc_group.classList.add("form-group");
                cvc_group.classList.add("cvc-group");
                let span_cvc = document.createElement("span");
                span_cvc.appendChild(document.createTextNode("驗證密碼 : "));
                let cvc =document.createElement("div");
                cvc.classList.add("form-control");
                cvc.classList.add("cvc");
                cvc_group.appendChild(span_cvc);
                cvc_group.appendChild(cvc);
                payment_info.appendChild(cvc_group);
                payment_info_container.appendChild(payment_info);
                pay.appendChild(payment_info_container);
                //class=final-payment
                let final_payment = document.createElement("div");
                final_payment.classList.add("final-payment");
                let final_payment_container = document.createElement("div");
                final_payment_container.classList.add("final-payment-container");
                let final_info= document.createElement("div");
                final_info.classList.add("final-info");
                let final_price_info = document.createElement("div");
                final_price_info.classList.add("final-price-info");
                let final_price = document.createElement("div");
                final_price.classList.add("final-price");
                final_price.appendChild(document.createTextNode("總價 : 新台幣"));
                let price_span = document.createElement("span");
                price_span.appendChild(document.createTextNode(` ${result.data.price} 元`));
                final_price.appendChild(price_span);
                let btn = document.createElement("button");
                btn.id =  "confirm-payment";
                let btn_span = document.createElement("span");
                btn_span.appendChild(document.createTextNode("確認訂購並付款"));
                btn.appendChild(btn_span);
                final_price_info.appendChild(final_price);
                final_price_info.appendChild(btn);
                final_info.appendChild(final_price_info);
                final_payment_container.appendChild(final_info);
                final_payment.appendChild(final_payment_container);
                let section2 = document.querySelector(".section-2");
                section2.after(sep1);
                sep1.after(section_3);
                section_3.after(sep2);
                sep2.after(pay);
                pay.after(final_payment);
                
                //get tappay prime section
                TPDirect.setupSDK(123850, 'app_UwUYEXdOybeVajggvvVsv12x9UefbL1Uv0ed34ZOlgamdRbjYnhxHxBIQupg', 'sandbox');
                TPDirect.card.setup({
                    fields: {
                        number: {
                            element: '.form-control.card-number',
                            placeholder: '**** **** **** ****'
                        },
                        expirationDate: {
                            element: document.getElementById('tappay-expiration-date'),
                            placeholder: 'MM / YY'
                        },
                        ccv: {
                            element: '.form-control.cvc',
                            placeholder: '後三碼'
                        }
                    },
                    styles: {
                        'input': {
                            'color': 'gray'
                        },
                        'input.ccv': {
                            'font-size': '16px'
                        },
                        ':focus': {
                            'color': 'black'
                        },
                        '.valid': {
                            'color': 'green'
                        },
                        '.invalid': {
                            'color': 'red'
                        },
                        '@media screen and (max-width: 400px)': {
                            'input': {
                                'color': 'orange'
                            }
                        }
                    }
                });

                // listen for TapPay Field
                TPDirect.card.onUpdate(function (update) {
                    /* Disable / enable submit button depend on update.canGetPrime  */
                    /* ============================================================ */

                    // update.canGetPrime === true
                    //     --> you can call TPDirect.card.getPrime()
                    const submitButton = document.getElementById("confirm-payment");
                    if (update.canGetPrime) {
                        submitButton.removeAttribute('disabled')
                        //submitButton.removeAttr('disabled')
                    } else {
                        submitButton.setAttribute('disabled', true)
                        //submitButton.attr('disabled', true)
                    };


                    /* Change card type display when card type change */
                    /* ============================================== */

                    // cardTypes = ['visa', 'mastercard', ...]
                    var newType = update.cardType === 'unknown' ? '' : update.cardType;
                    const cardType =document.getElementById("cardtype");
                    cardType.text = newType;



                    /* Change form-group style when tappay field status change */
                    /* ======================================================= */

                    // number 欄位是錯誤的
                    if (update.status.number === 2) {
                        setNumberFormGroupToError('.card-number-group')
                    } else if (update.status.number === 0) {
                        setNumberFormGroupToSuccess('.card-number-group')
                    } else {
                        setNumberFormGroupToNormal('.card-number-group')
                    }

                    if (update.status.expiry === 2) {
                        setNumberFormGroupToError('.expiration-date-group')
                    } else if (update.status.expiry === 0) {
                        setNumberFormGroupToSuccess('.expiration-date-group')
                    } else {
                        setNumberFormGroupToNormal('.expiration-date-group')
                    }

                    if (update.status.cvc === 2) {
                        setNumberFormGroupToError('.cvc-group')
                    } else if (update.status.cvc === 0) {
                        setNumberFormGroupToSuccess('.cvc-group')
                    } else {
                        setNumberFormGroupToNormal('.cvc-group')
                    }
                })


                const submitButton = document.getElementById("confirm-payment");

                submitButton.addEventListener('click', function (event) {

                    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
                    console.log(tappayStatus)

                    // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
                    if (tappayStatus.canGetPrime === false) {
                        alert('can not get prime')
                        return
                    }

                    // Get prime
                    TPDirect.card.getPrime(function (result) {
                        if (result.status !== 0) {
                            alert('get prime error ' + result.msg)
                            return
                        }else{ //successfullt get prime 
                            let payload = {}
                            payload["prime"] =  result.card.prime;
                            //get booked schedule info
                            let jwt = localStorage.getItem("JWT");    
                            let promise = getMemberTripInfo(jwt);
                            promise.then((result)=>{ 
                                payload["order"] = {};
                                payload["order"]["price"] = result["data"]["price"];
                                payload["order"]["trip"] = result["data"];
                                delete payload["order"]["trip"]["price"];
                                payload["order"]["contact"] = {};
                                let contact_name = document.getElementById("contact-name").value;
                                let contact_number = document.getElementById("contact-number").value;
                                let contact_email = document.getElementById("contact-email").value;
                                payload["order"]["contact"]["name"] = contact_name;
                                payload["order"]["contact"]["email"] = contact_email;
                                payload["order"]["contact"]["phone"] = contact_number;
                                let req = JSON.stringify(payload); //轉成json格式
                                sendOrder(req,jwt)
                                
                            })
                        }
                        
                    })
                })

            }else{ 
                let div = document.createElement("div");
                div.appendChild(document.createTextNode("目前沒有任何待預定的行程"));
                div.classList.add('no-schedule');
                let pending_sche_header = document.querySelector(".pending-sche-header");
                pending_sche_header.appendChild(div);
            }    
        }).catch((message)=>{
            console.log(message)
        })    
    }else{ //if false, show message
        let section2 = document.querySelector(".section-2");
        let child = document.querySelector('.pending-sche-container');
        section2.removeChild(child);
        section2.style["padding-top"]="20px";
        if(network_problem){
            section2.appendChild(document.createTextNode("不好意思載入頁面時發生錯誤"));
        }else{
            section2.appendChild(document.createTextNode("您好，請先登入，即將導回首頁"));
        }    
    }
}




async function getMemberTripInfo(jwt){
    try{
        let response = await fetch('/api/booking',{
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

//delete member's booked shcedule 
async function deleteTrip(){
    let jwt = localStorage.getItem("JWT"); 
    try{
        let response = await fetch('/api/booking',{
                                     method: 'delete',
                                     headers: {"Authorization" : `Bearer ${jwt}`}
                                    });                           
        if(response.ok){ 
            window.location.reload();
        }else{
            console.log('伺服器錯誤');
        }
    }catch(message){
        console.log(`${message}`)
        throw Error('Fetching was not ok!!.')
    }    
}


function setNumberFormGroupToError(selector) {
    $(selector).addClass('has-error')
    $(selector).removeClass('has-success')
}

function setNumberFormGroupToSuccess(selector) {
    $(selector).removeClass('has-error')
    $(selector).addClass('has-success')
}

function setNumberFormGroupToNormal(selector) {
    $(selector).removeClass('has-error')
    $(selector).removeClass('has-success')
}

async function sendOrder(payload,jwt){
    try{
        let response = await fetch('/api/orders',{
                                     method: 'post',
                                     body : payload,
                                     headers: {"Authorization" : `Bearer ${jwt}`,'Content-Type': 'application/json'}
                                    });
        let result = await response.json();                            
        if(response.ok){ //done paying,no matter success or fail
            window.location.href=`/thankyou?number=${result.data.number}`
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