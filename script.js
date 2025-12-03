let model;
let classNames;

// Load model on page load
window.onload = async function () {
    model = await tf.loadLayersModel("web_model/model.json");
    const res = await fetch("class_mapping.json");
    classNames = await res.json();
};

document.getElementById("imageUpload").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file || !model) return;

    const img = document.getElementById("uploadedImage");
    img.src = URL.createObjectURL(file);

    await img.onload;

    const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([64, 64])
        .toFloat()
        .div(255.0)
        .expandDims(0);

    const prediction = model.predict(tensor);
    const values = await prediction.data();

    const classIndex = values.indexOf(Math.max(...values));

    const plantName = classNames[classIndex.toString()];

    alert("Predicted Plant: " + plantName);
});
