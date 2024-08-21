//自定義
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

//登入狀態控制
//按登入按鈕後顯示登入畫面
document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('login').style.display = 'block';
});
//當本地存有token時，才顯示畫面。登入登出按鈕顯示
if(localStorage.getItem('token')) {
    document.getElementById('main').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'block';
    document.getElementById('loginButton').style.display = 'none';
}
//登出按鈕
document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.reload()
});

//登入流程
//TODO處理輸入或回傳為undefined的情況
document.getElementById("loginForm").addEventListener('submit', async function(loginEvent){
    // 阻止默認
    loginEvent.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    //post登入的用戶API資料
    try{
    const loginResponse = await fetch("https://reqres.in/api/login",{
        method:'post',
        headers:{
            'Content-Type':'application/json'},
        body: JSON.stringify({
            username, password})
    })
    if(!loginResponse.ok){
        throw new Error(`HTTP error! status: ${loginResponse.status}`);
    }
    
    //await來接要時間讀取的資料
    const loginData = await loginResponse.json()

    localStorage.setItem('token', loginData.token)
    document.getElementById('message').innerText = 'Login successful!';
    console.log(loginData.token)

    //成功登入後刷新畫面
    setTimeout(()=>{
        window.location.reload()
    }, 3000);
    }
    catch (error) {
    document.getElementById('message').innerText = 'Login failed: ' + error.message;
    }
});



//左邊按鈕控制右邊畫面顯示
    //.forEach把元素拆開，之後用this來指定要變動的元素
document.querySelectorAll('.page-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.page-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(this.dataset.page).style.display = 'block';
    });
});


//全局顏色切換
document.getElementById('colorSelector').addEventListener('change', async function() {

    var selectedColorValue = Number(document.getElementById('colorSelector').value);
    try{
        const colorResponse = await fetch("https://reqres.in/api/unknown",{
        method:'GET',
        headers:{
            'Content-Type':'application/json'
        }
        })
        const colorData = await colorResponse.json()
        //colorData.data是數組不能直接讀
        for(let item of colorData.data){
        if(selectedColorValue === item.id){
        var color = item.color
        document.getElementById('header').style.backgroundColor = color;
        document.getElementById('leftsideNav').style.backgroundColor = color;
        //.page-button是一組元素，把它當array拆開來處理
        var pageButtons = document.querySelectorAll('.page-button');
        for(var i = 0; i < pageButtons.length; i++) {
        pageButtons[i].style.backgroundColor = color;}
        }
        console.log(item.id);}


    } catch (error) {
        console.error('Error:', error);
    }
});



//用戶列表
var callUserListFormDataYet = false;
const callUserListFormData = async()=>{
    try{
        const userListResponse = await fetch("https://reqres.in/api/users?page=2",{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })
        userListData = await userListResponse.json()
        userListData.data.map((user, index)=>{
            const userDiv = document.createElement('div')
            userDiv.id = `userDiv${index}`;
            userDiv.className = 'userDiv';
            //生成用戶列表，要注意格式要跟html的父元素搭配
            userDiv.innerHTML = 
            `
            <div class="col">${user.id}</div>
            <img src="${user.avatar}" alt="avatar" class="col">
            <div class="col">${user.first_name}</div>
            <div class="col">${user.last_name}</div>
            <div class="col">${user.email}</div>
            <div class="col">
            <button type="button" class="userListUp">往上</button>
            <button type="button" class="userListDelete">刪除</button>
            <button type="button" class="userListDown">往下</button>
            </div>
            `
            const userListForm = document.getElementById('userListForm');
            //認親
            userListForm.appendChild(userDiv)

            //將唯一的div id傳入，將他們往上往下刪除的按鈕功能加入
            userDiv.querySelector('.userListUp').addEventListener('click', function () {
                const prevSibling = userDiv.previousElementSibling;
                if (prevSibling && prevSibling !== userDiv.parentNode.firstChild) { 
                    userDiv.parentNode.insertBefore(userDiv, prevSibling);
                }
            });
            userDiv.querySelector('.userListDelete').addEventListener('click', function () {
                const userId = index+7
                userListData.data = userListData.data.filter(user => user.id !== userId);
                userDiv.remove();
            });
            userDiv.querySelector('.userListDown').addEventListener('click', function () {
                const nextSibling = userDiv.nextElementSibling;
                if (nextSibling && nextSibling.nextElementSibling) { 
                    userDiv.parentNode.insertBefore(userDiv, nextSibling.nextElementSibling);
                } else if (!nextSibling.nextElementSibling) { 
                    userDiv.parentNode.appendChild(userDiv);
                }
            });
        })
    }
    catch (error) {
        console.error('Error:', error);
    }
};

document.getElementById('userListButton').addEventListener('click', function() {
    if(!callUserListFormDataYet){
    callUserListFormData()}
    callUserListFormDataYet = true;
});

//從大排到小
document.getElementById('userListSortMaxButton').addEventListener('click', function () {
    if (userListData && userListData.data) {
    userListData.data.sort((a, b) => b.id - a.id);}

    const userListForm = document.getElementById('userListForm');
    while (userListForm.childNodes.length > 1) {
        userListForm.removeChild(userListForm.childNodes[1]);
    }
    userListData.data.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.id = `userDiv${index}`;
        userDiv.className = 'userDiv';
        userDiv.innerHTML = 
        `
        <div class="col">${user.id}</div>
        <img src="${user.avatar}" alt="avatar" class="col">
        <div class="col">${user.first_name}</div>
        <div class="col">${user.last_name}</div>
        <div class="col">${user.email}</div>
        <div class="col">
        <button type="button" class="userListUp">往上</button>
        <button type="button" class="userListDelete">刪除</button>
        <button type="button" class="userListDown">往下</button>
        </div>
        `;
        userListForm.appendChild(userDiv);
        userDiv.querySelector('.userListUp').addEventListener('click', function () {
            const prevSibling = userDiv.previousElementSibling;
            if (prevSibling && prevSibling !== userDiv.parentNode.firstChild) { 
                userDiv.parentNode.insertBefore(userDiv, prevSibling);
            }
        });
        userDiv.querySelector('.userListDelete').addEventListener('click', function () {
            const userId = index+7
            console.log(userListData.data);
            console.log(userId);
            userListData.data = userListData.data.filter(user => user.id !== userId);
            userDiv.remove();
        });
        userDiv.querySelector('.userListDown').addEventListener('click', function () {
            const nextSibling = userDiv.nextElementSibling;
            if (nextSibling && nextSibling.nextElementSibling) { 
                userDiv.parentNode.insertBefore(userDiv, nextSibling.nextElementSibling);
            } else if (!nextSibling.nextElementSibling) { 
                userDiv.parentNode.appendChild(userDiv);
            }
        });
    });
});
//從小排到大
document.getElementById('userListSortMinButton').addEventListener('click', function () {
    if (userListData && userListData.data) {
    userListData.data.sort((a, b) => a.id - b.id);}

    const userListForm = document.getElementById('userListForm');
    while (userListForm.childNodes.length > 1) {
        userListForm.removeChild(userListForm.childNodes[1]);
    }
    userListData.data.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.id = `userDiv${index}`;
        userDiv.className = 'userDiv';
        userDiv.innerHTML = 
        `
        <div class="col">${user.id}</div>
        <img src="${user.avatar}" alt="avatar" class="col">
        <div class="col">${user.first_name}</div>
        <div class="col">${user.last_name}</div>
        <div class="col">${user.email}</div>
        <div class="col">
        <button type="button" class="userListUp">往上</button>
        <button type="button" class="userListDelete">刪除</button>
        <button type="button" class="userListDown">往下</button>
        </div>
        `;
        userListForm.appendChild(userDiv);
        userDiv.querySelector('.userListUp').addEventListener('click', function () {
            const prevSibling = userDiv.previousElementSibling;
            if (prevSibling && prevSibling !== userDiv.parentNode.firstChild) { 
                userDiv.parentNode.insertBefore(userDiv, prevSibling);
            }
        });
        userDiv.querySelector('.userListDelete').addEventListener('click', function () {
            const userId = index+7
            console.log(userListData.data);
            console.log(userId);
            userListData.data = userListData.data.filter(user => user.id !== userId);
            userDiv.remove();
        });
        userDiv.querySelector('.userListDown').addEventListener('click', function () {
            const nextSibling = userDiv.nextElementSibling;
            if (nextSibling && nextSibling.nextElementSibling) { 
                userDiv.parentNode.insertBefore(userDiv, nextSibling.nextElementSibling);
            } else if (!nextSibling.nextElementSibling) { 
                userDiv.parentNode.appendChild(userDiv);
            }
        });
    });
});

//用名字搜尋
document.getElementById('searchUserListFormButton').addEventListener('click', function () {

    var searchUserListFormValue = document.getElementById('searchUserListFormInput').value;
    if(searchUserListFormValue){
        let user = userListData.data.find(user => user.first_name === searchUserListFormValue);
        if (user) {
            userListData.data = [user];
            const userListForm = document.getElementById('userListForm');
            while (userListForm.childNodes.length > 1) {
                userListForm.removeChild(userListForm.childNodes[1]);
            }
            userListData.data.forEach((user, index) => {
                const userDiv = document.createElement('div');
                userDiv.id = `userDiv${index}`;
                userDiv.className = 'userDiv';
                userDiv.innerHTML = 
                `
                <div class="col">${user.id}</div>
                <img src="${user.avatar}" alt="avatar" class="col">
                <div class="col">${user.first_name}</div>
                <div class="col">${user.last_name}</div>
                <div class="col">${user.email}</div>
                <div class="col">
                <button type="button" class="userListUp">往上</button>
                <button type="button" class="userListDelete">刪除</button>
                <button type="button" class="userListDown">往下</button>
                </div>
                `;
                userListForm.appendChild(userDiv);
                userDiv.querySelector('.userListUp').addEventListener('click', function () {
                    const prevSibling = userDiv.previousElementSibling;
                    if (prevSibling && prevSibling !== userDiv.parentNode.firstChild) { 
                        userDiv.parentNode.insertBefore(userDiv, prevSibling);
                    }
                });
                userDiv.querySelector('.userListDelete').addEventListener('click', function () {
                    const userId = index+7
                    console.log(userListData.data);
                    console.log(userId);
                    userListData.data = userListData.data.filter(user => user.id !== userId);
                    userDiv.remove();
                });
                userDiv.querySelector('.userListDown').addEventListener('click', function () {
                    const nextSibling = userDiv.nextElementSibling;
                    if (nextSibling && nextSibling.nextElementSibling) { 
                        userDiv.parentNode.insertBefore(userDiv, nextSibling.nextElementSibling);
                    } else if (!nextSibling.nextElementSibling) { 
                        userDiv.parentNode.appendChild(userDiv);
                    }
                });
            });
          } else {
            document.getElementById('userListMessage').innerText = 'Not found! '
          }
    }
})



//搜尋用戶
//TODO: 輸入欄位為空時的不顯示
document.getElementById('searchUserButton').addEventListener('click', debounce(function() {
    var searchUserInputValue = document.getElementById('searchUserInput').value;
    // 获取 searchUserDiv
    var searchUserDiv = document.getElementById('searchUserDiv');
    // 如果 searchUserDiv 存在，那么就删除它
    if (searchUserDiv) {
        searchUserDiv.remove();
    }
    if(searchUserInputValue){
    searchUserListFormData(searchUserInputValue);}
} , 500));

async function searchUserListFormData(userId) {
    try {
        const searchUserListResponse = await fetch(`https://reqres.in/api/users/${userId}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })
        if(!searchUserListResponse.ok){
            throw new Error(`HTTP error! status: ${searchUserListResponse.status}`);
        }
        const searchUserListData = await searchUserListResponse.json()
        const searchUserDiv = document.createElement('div')
        searchUserDiv.id = 'searchUserDiv';
        //生成用戶列表，要注意格式要跟html的父元素搭配
        searchUserDiv.innerHTML = 
        `
        <div class="col">${searchUserListData.data.id}</div>
        <img src="${searchUserListData.data.avatar}" alt="avatar" class="col">
        <div class="col">${searchUserListData.data.first_name}</div>
        <div class="col">${searchUserListData.data.last_name}</div>
        <div class="col">${searchUserListData.data.email}</div>
        `
        const searchUserListForm = document.getElementById('searchUserListForm');
        //認親
        searchUserListForm.appendChild(searchUserDiv)
    }
    catch (error) {
        document.getElementById('searchUserListMessage').innerText = 'Login failed: ' + error.message;
    }
};



//新增更改刪除用戶
// 新增
document.getElementById('postUserButton').addEventListener('click', debounce(async function(postUserEvent) {

    postUserEvent.preventDefault();

    var postUserNameValue = document.getElementById('postUserName').value;
    var postUserJobValue = document.getElementById('postUserJob').value;

    if(postUserNameValue && postUserJobValue){
    try {
        const postUserListResponse = await fetch(`https://reqres.in/api/users`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                postUserNameValue, postUserJobValue})
        })
        const postUserListData = await postUserListResponse.json()
        document.getElementById('postUserMessage').innerText =
        'Post successful!' + '  ID: ' + postUserListData.id + '  time: ' + postUserListData.createdAt;
    }
    catch (error) {
        console.error('Error:', error);
    }}
},500));


// 刪除回傳狀態204
document.getElementById('deleteUserButton').addEventListener('click', debounce(function() {
    var deleteUserIdValue = document.getElementById('deleteUserId').value;
    if(deleteUserIdValue){
    deleteUserListFormData(deleteUserIdValue);}
}, 500));

async function deleteUserListFormData(userId) {

    try {
        const deleteUserListResponse = await fetch(`https://reqres.in/api/users/${userId}`,{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            },
        })
        document.getElementById('deleteUserMessage').innerText =
        'Delete successful!' + '  status:' + deleteUserListResponse.status;
    }
    catch (error) {
        console.error('Error:', error);
    }
};