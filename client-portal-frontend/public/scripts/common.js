export function loadScripts(){
    // Adding Bootstrap CSS dynamically to the head
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
    document.head.appendChild(link);

    // Adding Bootstrap JS dynamically to the body
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link2);

}

export function displayNav() {
    const token = localStorage.getItem("token");
    if(token){
        fetch('navbar-login.html')
        .then(response => response.text())
        .then(data => document.getElementById('navbar-placeholder').innerHTML = data);
    }else{
        fetch('navbar.html')
        .then(response => response.text())
        .then(data => document.getElementById('navbar-placeholder').innerHTML = data);
    }
    // Load the footer HTML content into the placeholder
    fetch('footer.html')
    .then(response => response.text())
    .then(data => document.getElementById('footer-placeholder').innerHTML = data);
}