// Load model and class mapping
let model;
let classMap = {};

async function loadModel() {
    try {
        model = await tf.loadLayersModel("web_model/model.json");

        const response = await fetch("class_mapping.json");
        classMap = await response.json();

        console.log("Model and class map loaded!");
    } catch (err) {
        console.error("Error loading model:", err);
    }
}

loadModel();

// Handle image upload
const imageUpload = document.getElementById("imageUpload");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const confidence = document.getElementById("confidence");

imageUpload.addEventListener("change", async function () {
    const file = imageUpload.files[0];
    if (!file) return;

    // Display preview
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    // Wait for preview to load
    await new Promise((res) => (preview.onload = res));

    // Convert image to tensor
    let tensor = tf.browser.fromPixels(preview)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();

    // Run prediction
    const prediction = model.predict(tensor);
    const scores = prediction.dataSync();

    const predictedIndex = scores.indexOf(Math.max(...scores));
    const plantName = classMap[predictedIndex] || "Unknown Plant";
    const conf = (Math.max(...scores) * 100).toFixed(2);

    // Display output
    result.textContent = `🌿 Predicted Plant: ${plantName}`;
    confidence.textContent = `Confidence: ${conf}%`;
});
