let model;
let classMap = {};

async function loadModel() {
    model = await tf.loadLayersModel("web_model/model.json");

    const response = await fetch("class_mapping.json");
    classMap = await response.json();

    console.log("Model loaded.");
}

loadModel();

document.getElementById("imageUpload").addEventListener("change", async function () {
    const file = this.files[0];
    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(file);
    img.style.display = "block";

    await predictImage(img);
});

async function predictImage(img) {
    // Resize + normalize
    let tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([180, 180])
        .toFloat()
        .div(255.0)
        .expandDims();

    const prediction = model.predict(tensor);
    const probs = await prediction.data();

    const topIndex = probs.indexOf(Math.max(...probs));
    const plantName = classMap[topIndex] || "Unknown plant";
    const confidence = Math.max(...probs);

    document.getElementById("result").innerText = "🌱 Plant: " + plantName;
    document.getElementById("confidence").innerText = 
        "Confidence: " + (confidence * 100).toFixed(2) + "%";
}
