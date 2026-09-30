// get the DOM elements for image upload:
const fileInput = document.querySelector('input');
const sendBtn = document.querySelector('button');
const uploadedImg = document.querySelector('img');

// get DOM elements for displaying meal info:
const mealNameH3 = document.querySelector("#meal-name");
const descriptionP = document.querySelector("#description");
const caloriesP = document.querySelector("#calorie-count");

// Elements for loading circle
const spinner = document.getElementById("spinner")

// call a function which runs when user browses for file
fileInput.addEventListener('change', displayUploadedImage);
// call a function which runs when user clicks Analyze btn
sendBtn.addEventListener('click', sendImageForAnalysis);

// instantiate vars in global scope (needed by TWO diff functions)
let uploadedFile;
let imageSrc;
let formData;

// define the function that runs when user clicks Choose File
function displayUploadedImage() {
    // clear text from previous meal analysis
    mealNameH3.innerHTML = "";
    descriptionP.innerHTML = "";
    caloriesP.innerHTML = "";
    // store the uploaded img obj as var.. uploaded img exists as item 0 of files array which is a property of the fileInput obj
    uploadedFile = fileInput.files[0];
    // instantiate a FormData objecdt
    formData = new FormData();
    // append the uploaded image "blob" to the formData obj;
    // the uploadedImg is the value of a key called "image"
    formData.append("image", uploadedFile);

    // set imgSrc to to an instance of the URL.createObjectURL, taking 
    // the uploaded “blob” (binary large object) as arg: 
    imageSrc = URL.createObjectURL(uploadedFile);

    // Set the source of the img element:
    uploadedImg.src = imageSrc;
    
    console.log("imageSrc:", imageSrc, typeof(imageSrc)); // string 
    console.log("uploadedFile blob:", uploadedFile, typeof(uploadedFile)); // obj
}

// defiine function which runs when user clicks Analyze:
async function sendImageForAnalysis() {
    // if user clicked Analyze w/o uploading image:
    if(!uploadedImg) {
        mealNameH3.textContent = "Upload a meal image to analyze!";
        return; // exit the function so no more code runs
    }

    // Check if loader is currently hidden
    var isLoading = spinner.classList.contains('hidden')

    if (isLoading) {
        spinner.classList.remove('hidden')
    } else {
        spinner.classList.add('hidden')
    }

    try {
        const res = await fetch("/upload", { method: "POST", body: formData });
        const resJson = await res.json();
        mealNameH3.innerHTML = resJson.meal_name;
        descriptionP.innerHTML = resJson.meal_description;
        caloriesP.innerHTML = "Calories: " + resJson.total_calories;
    } 
    catch (error) {
        console.error("Error:", error);
        mealNameH3.innerHTML = "Error analyzing meal. Please try again.";
    }
    
    // hide the spinner once done
    spinner.classList.add('hidden')
}  