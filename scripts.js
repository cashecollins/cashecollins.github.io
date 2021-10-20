window.addEventListener('scroll', () => {
    if ((window.scrollY || window.pageYOffset) > 200) {
        document.querySelector('.nav-bar').className = 'nav-bar light'
    } else {
        document.querySelector('.nav-bar').className = 'nav-bar dark'
    }
    if (isInViewPort(document.getElementById('intro'))){
	console.log('something awesome happened here')
	document.getElementById('front-end').style.height = "95%";
	document.getElementById('back-end').style.height = "80%";
	document.getElementById('design').style.height = "55%";
	document.getElementById('dev-ops').style.height = "85%";
	document.getElementById('html-css').style.height = "75%";
    }
})

function isInViewPort(element){
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
