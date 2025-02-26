window.addEventListener('scroll', () => {
    if ((window.scrollY || window.pageYOffset) > 200) {
        document.querySelector('.nav-bar').className = 'nav-bar light';
    } else {
        document.querySelector('.nav-bar').className = 'nav-bar dark';
    }
    if (isInViewPort(document.getElementById('intro'))){
        document.getElementById('front-end').style.height = "80%";
        document.getElementById('back-end').style.height = "95%";
        document.getElementById('design').style.height = "55%";
        document.getElementById('dev-ops').style.height = "90%";
        document.getElementById('html-css').style.height = "75%";
    }
});

function isInViewPort(element){
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===== Start Typewriter =====

var TxtRotate = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

  var that = this;
  var delta = 300 - Math.random() * 100;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
};

window.onload = function() {
  var elements = document.getElementsByClassName('txt-rotate');
  for (var i=0; i<elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-rotate');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtRotate(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
  document.body.appendChild(css);

  // Add event listeners for project cells
  var projectCells = document.getElementsByClassName('project-cell');
  for (var j = 0; j < projectCells.length; j++) {
    projectCells[j].addEventListener('click', function() {
      openModal(this);
    });
  }
};

function openModal(element) {
  var modal = document.getElementById('project-modal');
  var modalContent = document.getElementById('modal-content');
  var projectTitle = element.querySelector('.project-cell-title').innerText;
  var projectDetails = getProjectDetails(projectTitle);
  var projectBanner = getProjectBanner(projectTitle);

  modalContent.innerHTML = `
    <div class="modal-banner" style="background-image: url(${projectBanner});"></div>
    <h2>${projectTitle}</h2>
    <div class="modal-details">${projectDetails}</div>
    <button onclick="window.open('${getProjectLink(projectTitle)}', '_blank')">Visit Project</button>
    <button class="secondary" onclick="closeModal()">Close</button>
  `;
  modal.style.display = 'block';
}

function closeModal() {
  var modal = document.getElementById('project-modal');
  modal.style.display = 'none';
}

function getProjectDetails(title) {
  var details = {
    "Impact Suite": "Details about Impact Suite and your role...",
    "Rent Plus": "Details about Rent Plus and your role...",
    "Ensemble": "Details about Ensemble and your role...",
    "HCP": "Details about HCP and your role...",
    "Live St. George": "Details about Live St. George and your role...",
    "Stat Tracker": "Details about Stat Tracker and your role...",
    "Rails Rest Api": "Details about Rails Rest Api and your role...",
    "DevTEC AI": "Details about DevTEC AI and your role..."
  };
  return details[title] || "No details available.";
}

function getProjectBanner(title) {
  var banners = {
    "Impact Suite": "css/assets/lsg-home.jpg",
    "Rent Plus": "css/assets/rent-plus-banner.jpg",
    "Ensemble": "css/assets/ensemble-banner.jpg",
    "HCP": "css/assets/hcp-banner.jpg",
    "Live St. George": "css/assets/live-st-george-banner.jpg",
    "Stat Tracker": "css/assets/stat-tracker-banner.jpg",
    "Rails Rest Api": "css/assets/rails-rest-api-banner.jpg",
    "DevTEC AI": "css/assets/devtec-ai-banner.jpg"
  };
  return banners[title] || "path/to/default-banner.jpg";
}

function getProjectLink(title) {
  var links = {
    "Impact Suite": "https://impactsuite.com",
    "Rent Plus": "https://example.com/rent-plus",
    "Ensemble": "https://ensemblehp.com",
    "HCP": "https://healthcarecompliancepros.com",
    "Live St. George": "https://livestg.com",
    "Stat Tracker": "https://example.com/stat-tracker",
    "Rails Rest Api": "https://example.com/rails-rest-api",
    "DevTEC AI": "https://example.com/devtec-ai"
  };
  return links[title] || "#";
}

// ===== End Typewriter =====
