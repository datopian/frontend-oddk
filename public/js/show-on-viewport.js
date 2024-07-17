// Function to remove 'none-' from data-datapackage attribute
function removeNonePrefix(element) {
  let attrValue = element.getAttribute("data-datapackage");
  if (attrValue.startsWith("none-")) {
    element.setAttribute("data-datapackage", attrValue.substring(5));
  }
}

function load_js(source_file) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.src = source_file;
  head.appendChild(script);
}

// Intersection Observer options
let options = {
  root: null, // relative to document viewport
  rootMargin: "0px", // margin around root. Values are similar to css property. Unitless values not allowed
  threshold: 0.5, // visible amount of item shown in relation to root
};

// Callback function to be executed when a target is intersected
let callback = (entries, observer) => {
  entries.forEach((entry) => {
    // If the element is in the viewport
    if (entry.isIntersecting) {
      removeNonePrefix(entry.target);
    }
  });
};

// Create Intersection Observer
let observer = new IntersectionObserver(callback, options);

// Target all elements with the `data-datapackage` attribute
let targets = document.querySelectorAll("[data-datapackage]");
targets.forEach((target) => observer.observe(target));
