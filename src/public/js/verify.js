document.addEventListener('DOMContentLoaded', () => {
    const verifyForm = document.getElementById('verifyForm');
    const errorMessage = document.getElementById('error-message');

    verifyForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = document.getElementById('token').value;

        try {
            const response = await fetch('/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/';
            } else {
                errorMessage.textContent = result.message || 'Verification failed';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        }
    });
});