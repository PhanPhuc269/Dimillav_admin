document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const username = document.getElementById('floatingText').value;
    const email = document.getElementById('floatingInput').value;
    const password = document.getElementById('floatingPassword').value;
    const repeatPassword = document.getElementById('floatingRepeatPassword').value;
    const messageDiv = document.getElementById('message');

    if (password !== repeatPassword) {
        messageDiv.textContent = 'Passwords do not match!';
        messageDiv.classList.add('alert-danger');
        messageDiv.style.display = 'block';
        return;
    }

    //Kiểm tra độ phức tạp mật khẩu
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        messageDiv.textContent = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
        messageDiv.classList.add('alert-danger');
        messageDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const body = await response.json();
        const status = response.status;

        if (status === 201) {
            messageDiv.textContent = 'Registration successful!';
            messageDiv.classList.remove('alert-danger');
            messageDiv.classList.add('alert-success');
            //Chuyển tới trang đăng nhập
            window.location.href = '/auth/authentication';
        } else {
            messageDiv.textContent = body.message || 'Registration failed!';
            messageDiv.classList.remove('alert-success');
            messageDiv.classList.add('alert-danger');

        }
        messageDiv.style.display = 'block';
    } catch (error) {
        messageDiv.textContent = 'An error occurred!';
        messageDiv.classList.remove('alert-success');
        messageDiv.classList.add('alert-danger');
        messageDiv.style.display = 'block';
    }
});