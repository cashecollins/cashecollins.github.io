window.addEventListener('scroll', () => {
    if ((window.scrollY || window.pageYOffset) > 200) {
        document.querySelector('.nav-bar').className = 'nav-bar light'
    } else {
        document.querySelector('.nav-bar').className = 'nav-bar dark'
    }
})