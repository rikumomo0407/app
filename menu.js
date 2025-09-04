window.addEventListener("load", ()=>{
    const button = document.getElementById('menu-button');
    const index = document.getElementById('index');
    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            index.style.display = "none";
            button.checked = false;
        };
    });
    button.addEventListener('click', () => {
        if (button.checked) {
            index.animate({opacity: [0, 1], transform: ["translateY(-20px)", "translateY(0)"]}, 300);
            index.style.display = "block";
        } else {
            index.style.display = "none";
        };
    });
    index.addEventListener('click', () => {
        index.style.display = "none";
        button.checked = false;
    });
});