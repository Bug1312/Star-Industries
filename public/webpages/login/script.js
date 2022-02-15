function loginAttempt(event) {
    event.preventDefault();
    fetch("/post-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        })
    }).then(response => response.text()).then(text => JSON.parse(text)).then(response => {
        console.log(response)
        if (response.success) {
            let date = new Date();
            date.setTime(date.getTime() + (1000 * 60 * 60))
            document.cookie = `session_key=${response.session_key};expires=${date.toUTCString()};`
            window.location.href = "/panel";
        } else alert("Incorrect user / pass")
    });
}