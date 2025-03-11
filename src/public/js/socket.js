
// Ví dụ: tự động cuộn đến cuối phần tin nhắn khi gửi tin mới
//const chatModal = document.getElementById('chatModal');
const socket = io();
let username;
let receiverUsername;
const chatList = document.getElementById('chat-list');
const chatContent = document.getElementById('chat-content');
const messages = chatContent;

document.addEventListener('DOMContentLoaded', function () {
    messages.scrollTop = messages.scrollHeight;
    const chatHeader = document.getElementById('chat-header');
    if (receiverUsername === undefined && chatHeader) {
        receiverUsername = chatHeader.getAttribute('data-connect');
    }
    // Thêm sự kiện click cho mỗi mục trong danh sách chat
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function (event) {
            const chatItem = event.target.closest('.chat-item');
            receiverUsername = this.getAttribute('data-connect');
            const name = this.querySelector('.fw-bold').textContent;
            const avatar = chatItem.querySelector('img').src;
            fetchMessages(receiverUsername, name, avatar);
            // Xóa badge khi người dùng chọn chat với người khác
            const badge = chatItem.querySelector('.badge.bg-danger');
            badge.textContent = '';


        });
    });
    //Lấy link ảnh từ header
    const avatar = document.getElementById('avatar').src;

    // Hàm để lấy và hiển thị tin nhắn
    function fetchMessages(username, name, avatar) {
        // Tạo tiêu đề và gắn tên người nhận nếu chưa có
        const chatHeader = document.getElementById('chat-header');
        //Gắn giá trị username vào data-connect
        chatHeader.setAttribute('data-connect', username);
        // Nêu chưa có thì tạo mới
        if (!chatHeader.querySelector('.fw-bold')) {
            const chatTitle = document.createElement('div');
            chatTitle.classList.add('d-flex', 'flex-row', 'align-items-center', 'mb-2', 'border-bottom');
            chatTitle.innerHTML = `
                <img src="${avatar}" alt="avatar" class="rounded-circle me-2" style="width: 40px; height: 40px;">
                <h5 class="fw-bold mb-0">${name}</h5>
            `;
            chatHeader.appendChild(chatTitle);
        } else {
            // Nếu đã có thì cập nhật tên người nhận
            chatHeader.querySelector('.fw-bold').textContent = name;
        }


        // Giả sử bạn có một API để lấy tin nhắn
        fetch(`/chat/messages/${username}`)
            .then(response => response.json())
            .then(data => {
                // Cập nhật url
                history.pushState(null, null, `/chat/${username}`);
                chatContent.innerHTML = ''; // Xóa nội dung cũ
                data.messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('d-flex', 'flex-row', message.sender === username ? 'justify-content-start' : 'justify-content-end');
                    if (message.sender === username) {
                        messageElement.innerHTML = `
                            <div class="d-flex flex-row justify-content-start">
                                <img src="${message.avatar}" alt="avatar 1" class="rounded-circle me-lg-2" style="width: 40px; height: 40px;">
                                <div>
                                <p class="small p-2 ms-3 mb-1 rounded-3 bg-body-tertiary">${message.message}</p>
                                <p class="small ms-3 mb-3 rounded-3 text-muted float-end">${formatTime(message.timestamp)}</p>
                                </div>
                            </div>
                        `;
                    } else {
                        messageElement.innerHTML = `
                        <div class="d-flex flex-row justify-content-end">
                            <div>
                            <p class="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">${message.message}</p>
                            <p class="small me-3 mb-3 rounded-3 text-muted">${formatTime(message.timestamp)}</p>
                            </div>
                            <img src="${avatar}" class="rounded-circle me-lg-2" style="width: 40px; height: 40px;">
                        </div>
                        `;
                    }
                    chatContent.appendChild(messageElement);
                    messages.scrollTop = messages.scrollHeight;
                });
            })
            .catch(error => console.error('Error fetching messages:', error));
    }


    // Thêm tin nhắn khi người dùng nhập tin nhắn và nhấn Enter
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const messageText = chatInput.value.trim();
            if (messageText) {
                const messageData = {
                    sender: username,  // Bạn có thể thay đổi hoặc lấy từ thông tin người dùng đăng nhập
                    receiver: receiverUsername,//(userId !='66c88776614bf1e4ccfca969')? '66c88776614bf1e4ccfca969': '66caf87123950ddd71daaeab',  // Nhận từ input hoặc logic phía server
                    message: messageText,
                    timestamp: new Date().toISOString(),
                };
                socket.emit('chat message', messageData);

                const newMessage = document.createElement('div');
                newMessage.classList.add('d-flex', 'flex-row', 'justify-content-end');
                newMessage.innerHTML = `
                    <div>
                        <p class="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">${messageData.message}</p>
                        <p class="small me-3 mb-3 rounded-3 text-muted">${formatTime(messageData.timestamp)}</p>
                    </div>
                    <img src="${avatar}" class="rounded-circle me-lg-2" style="width: 40px; height: 40px;">
                `;
                
                messages.appendChild(newMessage);
                chatInput.value = '';
                messages.scrollTop = messages.scrollHeight;

                //Tìm thẻ div chứa .chat-item và data-connect = data.sender
                const chatItem = document.querySelector(`.chat-item[data-connect="${receiverUsername}"]`);
                // Nếu đã tồn tại thì cập nhật số tin nhắn mới
                const badge = chatItem.querySelector('.badge.bg-danger');
                badge.textContent = '';
                // Di chuyển lên trên cùng
                chatList.prepend(chatItem);
                // Cập nhật tin nhắn mới nhất
                const message = chatItem.querySelector('.small.text-muted.truncate');
                message.textContent = 'Bạn: ' + messageText;
                // Cập nhật thời gian mới nhất
                const timestamp = chatItem.querySelector('.small.text-muted.mb-1');
                timestamp.textContent = formatTime(messageData.timestamp);
            }

        }
    });
    // Hàm formatTime để định dạng thời gian
    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
    
        if (date.toDateString() === now.toDateString()) {
            // Hiển thị giờ nếu là thời gian trong ngày hôm nay
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            // Hiển thị ngày/tháng nếu không phải là thời gian trong ngày hôm nay
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `${time} | ${day}/${month}`;
        }
    }
});
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        // Hiển thị giờ nếu là thời gian trong ngày hôm nay
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
        // Hiển thị ngày/tháng nếu không phải là thời gian trong ngày hôm nay
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${time} | ${day}/${month}`;
    }
}
// Đăng ký username khi kết nối
socket.on('register', (data) => {
    username = data.username;
});
socket.on('load old messages', (messagesList) => {
   
    messages.innerHTML = ``;
    messagesList.forEach((message) => {
        if(message.sender == username){
            const newMessage = document.createElement('div');
            newMessage.className = 'message my-2 p-2 text-black rounded';
            newMessage.textContent = message.message;
            messages.appendChild(newMessage);
        }
        else{
            const newMessage = document.createElement('div');
            newMessage.className = 'response my-2 p-2 text-white rounded';
            newMessage.textContent = message.message;
            messages.appendChild(newMessage);
        }
    });
    messages.scrollTop = messages.scrollHeight;
});


// Nhận và hiển thị tin nhắn
socket.on('chat message', (data) => {
    // Ứng dụng có được đang sử dụng là tab hiện tại không
    if (document.hidden) {
        // Hiển thị thông báo
        const notification = new Notification("Bạn có tin nhắn mới", {
            body: `${data.title}: ${data.message}`,
            icon: '/img/logo.png',
        });
        notification.onclick = function () {
            // Mở thẻ ứng dụng khi người dùng nhấn vào thông báo
            window.focus();
            //Kiểm url hiện tại
            const url = window.location.href;
            if (url.indexOf(data.sender) === -1) {
                //chuyển tới url
                window.location.href = `/chat/${data.sender}`;
            }
        };
    }
    //Kiểm url hiện tại
    const url = window.location.href;
    //Nếu url hiện tại không phải là trang chat với người gửi tin nhắn thì hiển thị thông báo
    if (url.indexOf(data.sender) === -1) {
        showToast(`${data.message}`, 'info', `${data.sender}`);
    }
    

     //Tìm thẻ div chứa .chat-item và data-connect = data.sender
    const chatItem = document.querySelector(`.chat-item[data-connect="${data.sender}"]`);
    //Nếu không tìm thấy thì tạo mới
    if (!chatItem) {
        const newChatItem = document.createElement('li');
        newChatItem.classList.add('p-2', 'border-bottom', 'chat-item');
        newChatItem.setAttribute('data-connect', data.sender);

        newChatItem.innerHTML = `
            <a href="#!" class="d-flex justify-content-between">
                <div class="d-flex flex-row">
                    <div>
                        <img src="${data.avatar}" alt="avatar" class="d-flex align-self-center me-3" width="60">
                        <span class="badge bg-success badge-dot"></span>
                    </div>
                    <div class="pt-1">
                        <p class="fw-bold mb-0">${data.title}</p>
                        <p class="small text-muted truncate">${data.message}</p>
                    </div>
                </div>
                <div class="pt-1">
                    <p class="small text muted mb-1">${formatTime(data.timestamp)}</p>
                    <span class="badge bg-danger rounded-pill float-end">1</span>
                </div>
            </a>
        `;
        chatList.appendChild(newChatItem);
    } else {
        // Nếu đã tồn tại thì cập nhật số tin nhắn mới
        const badge = chatItem.querySelector('.badge.bg-danger');
        badge.textContent = (badge.textContent=='' ? 0 :parseInt(badge.textContent))  + 1;
        // Di chuyển lên trên cùng
        chatList.prepend(chatItem);
        // Cập nhật tin nhắn mới nhất
        const message = chatItem.querySelector('.small.text-muted.truncate');
        message.textContent = data.title + ': ' + data.message;
        // Cập nhật thời gian mới nhất
        const timestamp = chatItem.querySelector('.small.text-muted.mb-1');
        timestamp.textContent = formatTime(data.timestamp);

    }
    // Kiểm tra ngươi dùng đang xem chat với ai
    const chatHeader = document.getElementById('chat-header');
    const receiver = chatHeader.getAttribute('data-connect');
    // Nếu người dùng đang xem chat với người gửi tin nhắn thì hiển thị tin nhắn
    if (receiver === data.sender) {
        const newMessage = document.createElement('div');
        newMessage.classList.add('d-flex', 'flex-row', 'justify-content-start');

        newMessage.innerHTML = `
            <img src="${data.avatar}" alt="avatar 1" class="rounded-circle me-lg-2" style="width: 40px; height: 40px;">
            <div>
                <p class="small p-2 ms-3 mb-1 rounded-3 bg-body-tertiary">${data.message}</p>
                <p class="small ms-3 mb-3 rounded-3 text-muted float-end">${formatTime(data.timestamp)}</p>
            </div>
        `;

        messages.appendChild(newMessage);
        messages.scrollTop = messages.scrollHeight;
    }

});
// Gọi sự kiện logout khi người dùng truy cập vào endpoint /logout
document.getElementById('logoutButton').addEventListener('click', () => {
    socket.emit('disconnect');
});