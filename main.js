const API_KEY = "28786902-96cb59f5df9a3122bb1313ed0";
const BASE_URL = "https://pixabay.com";
const PER_PAGE = 20;
const imageContainer = document.getElementById("image_container");
const searchForm = document.getElementById("search_form");
const spinner = document.getElementById("spinner");
const pagination = document.querySelector(".pagination");
let currentPageNumber = 1;
let currentTextSearch = "";


const getSearchableUrl = (searchString = "", pageNumber = 1) => {
    const encodedParams = encodeURIComponent(searchString);
    return `${BASE_URL}/api/?key=${API_KEY}&page=${pageNumber}&per_page=${PER_PAGE}&q=${encodedParams}`
}

const getFetchImages = async (searchQuery = "", pageNumber = 1) => {
    try {
        currentPageNumber = pageNumber;
        const url = getSearchableUrl(searchQuery,pageNumber);
        spinner.classList.remove("d-none");
        const response = await fetch(url);
        const data = await response.json();
        spinner.classList.add("d-none");
        if(!!data?.hits?.length) {
            injectToBody(data.hits);
        }
    } catch(error){
        console.error(error);
    }
    
}

const injectToBody = (imageData) => {
    imageData.forEach((image,index) => {
        createCardWithData(image,index);
    })
}

const createCardWithData = (cardData,index) => {
    const card = document.createElement("div");
    card.setAttribute("class","card mt-3 image-card");
    card.setAttribute("style","width: 18rem;");
    card.innerHTML = `
        <img src="${cardData.largeImageURL}"  style="height:150px;" class="card-img-top">
        <div class="card-body">
        <div class="d-flex flex-wrap" style="gap:10px;">
        <p style="color:var(--bs-gray);font-size:12px;">Downloads: <span class="text-success">${cardData.downloads}</span></p>
        <p style="color:var(--bs-gray);font-size:12px;">Views: <span class="text-success">${cardData.views}</span></p>
        <p style="color:var(--bs-gray);font-size:12px;">Likes: <span class="text-success">${cardData.likes}</span></p>
        </div>
        <div class="d-grid">
            <div data-image="${cardData.largeImageURL}" id="buzzinga_btn" class="btn btn-primary"><i data-image="${cardData.largeImageURL}" class="bi bi-download"></i> Download</div>
        </div>
        </div>
    `;
    imageContainer.appendChild(card);
}


document.addEventListener("DOMContentLoaded", ()=> {
    getFetchImages();
})

imageContainer.addEventListener("DOMNodeInserted", (event) => {
    const buttonElement = event.target.querySelector("#buzzinga_btn");
    buttonElement.addEventListener("click",(imageEvent)=> {
        const image = imageEvent.target.getAttribute("data-image");
        downloadImage(image, Date.now());
    })
})

const downloadImage = async (imageUrl = "", filename = "image") => {
    try {
       const request = new Request(imageUrl);
       const response = await fetch(request);
       const blob = await response.blob();
       const blobUrl = window.URL.createObjectURL(blob);
       const hyperlink = document.createElement("a");
       hyperlink.href = blobUrl;
       hyperlink.setAttribute("download", filename);
       document.body.appendChild(hyperlink);
       hyperlink.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
      hyperlink.remove();
    } catch(error) {
        console.error(error);
    }
}

searchForm.addEventListener("submit", (event)=> {
    event.preventDefault();
    const search = document.getElementById("search").value;
    currentTextSearch = search;
    imageContainer.innerHTML = "";
    getFetchImages(search, currentPageNumber);
})

pagination.addEventListener("click", (event) => {
    event.preventDefault();
   const clickedValue = event.target.innerHTML;
    const activePageLink = pagination.querySelector(".active");
    if(clickedValue !== "Previous" || clickedValue !== "Next"){
        activePageLink.classList.remove("active");
        event.target.parentElement.classList.add("active")
    }
   let nextPage = 1;
   if(clickedValue === "Previous" && currentPageNumber !== 1) {
        nextPage = currentPageNumber - 1;
   } else if(clickedValue === "Next") {
        nextPage = currentPageNumber + 1;
   } else if (!!Number(clickedValue)){
     nextPage = Number(clickedValue);
   }
   if(nextPage !== currentPageNumber){
    imageContainer.innerHTML = ""
    getFetchImages(currentTextSearch, nextPage);
   }
})
