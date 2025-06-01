let model = null;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultSpan = document.getElementById('result');

// set Camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

function capture() {
    const size = 100;
    const canvasCtx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
  
    // get center
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const shortSide = Math.min(vw, vh);
    const sx = (vw - shortSide) / 2;
    const sy = (vh - shortSide) / 2;
  
    canvasCtx.drawImage(video, sx, sy, shortSide, shortSide, 0, 0, size, size);

    // video.style.display = 'none';
    canvas.style.display = 'block';

    // restore picture
    imageDataURL = canvas.toDataURL();

    // change button
    const btn = document.querySelector('button[onclick="capture()"]');
    btn.innerText = "Retake Picture";
    btn.setAttribute("onclick", "resetCamera()");
  
    // show Predict 
    showPredictButton();
  }

  function showPredictButton() {
    document.getElementById("predictBtn").style.display = "inline-block";
  }

function resetCamera() {
  // video.style.display = 'block';
  canvas.style.display = 'none';

  const btn = document.querySelector('button[onclick="resetCamera()"]');
  btn.innerText = "Take Picture";
  btn.setAttribute("onclick", "capture()");


  document.getElementById("predictBtn").style.display = "none";
  document.getElementById("result").innerText = "None";
}

async function predict() {
  const selectedModel = document.getElementById("modelSelect").value;
  if (!imageDataURL || !selectedModel) {
    alert("Missing image or model");
    return;
  }

  const formData = new FormData();
  const blob = dataURItoBlob(imageDataURL);
  formData.append("image", blob, "captured.png");
  formData.append("model", selectedModel);

  try {
    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    document.getElementById("result").innerText = `${result.class || result.level}, prob: ${result.confidence.toFixed(2)}`;
  } catch (e) {
    document.getElementById("result").innerText = "Prediction failed.";
    console.error(e);
  }
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mimeString });
}


// didn't use this funciton
function showCaptureHistory(video, modelName) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;
    const tempCtx = tempCanvas.getContext('2d');
  
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const shortSide = Math.min(vw, vh);
    const sx = (vw - shortSide) / 2;
    const sy = (vh - shortSide) / 2;
  
    tempCtx.drawImage(video, sx, sy, shortSide, shortSide, 0, 0, 300, 300);
  
    const imgData = tempCanvas.toDataURL();
  
    const resultText = resultSpan.innerText;
  
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <img src="${imgData}" />
      <p><strong>Model used:</strong> ${modelName}</p>
      <p><strong>Predicted result:</strong> ${resultText}</p>
    `;
    document.getElementById('history-list').prepend(card);
  
    const stored = JSON.parse(localStorage.getItem("captureHistory") || "[]");
    stored.unshift({ imgData, modelName, resultText });
    localStorage.setItem("captureHistory", JSON.stringify(stored));
  }

  window.addEventListener("load", () => {
    const stored = JSON.parse(localStorage.getItem("captureHistory") || "[]");
    stored.forEach(({ imgData, modelName, resultText }) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <img src="${imgData}" />
        <p><strong>Model used:</strong> ${modelName}</p>
        <p><strong>Predicted result:</strong> ${resultText}</p>
      `;
      document.getElementById('history-list').appendChild(card);
    });
  });

  function switchMode(mode) {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const activeBtn = document.querySelector(`.nav-btn[onclick*="${mode}"]`);
    activeBtn.classList.add("active");
  
    const action = document.getElementById("cameraArea");
  
    if (mode === "camera") {
      action.innerHTML = `
        <action id="cameraArea">
            <video id="video" autoplay playsinline></video>
            <br>
            <section>
                <button onclick="capture()">take picture</button>
            
                <select id="modelSelect">
                    <option value="cnn">CNN</option>
                    <option value="efficient">Efficient</option>
                    <option value="resnet">ResNet</option>
                    <option value="transformer">Transformer</option>
                </select> 

                <button id="predictBtn" onclick="predict()" style="display:none;">Predict</button>               
            </section>
        </action>
      `;
      // Reset Camera
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        const video = document.getElementById("video");
        video.srcObject = stream;
      });

      canvas.style.display = 'none';
      document.getElementById("result").innerText = "None";
    }
  
    if (mode === "demo") {
        cameraArea.innerHTML = `
            <div id="demo-grid" style="display: flex; flex-wrap: wrap; gap: 20px;"></div>
          <br>
            <label for="modelSelect">Select Model:</label>
            <select id="modelSelect">
                <option value="cnn">CNN</option>
                <option value="efficient">Efficient</option>
                <option value="resnet">ResNet</option>
                <option value="transformer">Transformer</option>
            </select> 
            <br>
            <br>
            <button id="predictBtn" onclick="predictFromDemo()">Predict</button>  
        `;
        loadDemoOptions(); // Show Demo Picture

        canvas.style.display = 'none';
        document.getElementById("result").innerText = "None";
      }
    
  }

  function displayDemoImage(filename) {
    const preview = document.getElementById('demoPreview');
    preview.src = `${filename}`;
  }
  
  async function loadDemoOptions() {
    const response = await fetch('demo/demo_list.json');
    const demoImages = await response.json();
  
    const grid = document.getElementById("demo-grid");
    grid.innerHTML = ''; // clean up

    grid.style.display = "flex";
    grid.style.flexWrap = "wrap";
    grid.style.justifyContent = "center";
    grid.style.gap = "30px";
    grid.style.width = "100%";       
    grid.style.maxWidth = "100%";    

    demoImages.forEach((filename, index) => {
      const container = document.createElement("demo");
      container.style.textAlign = "center";
  
      const img = document.createElement("img");
      img.src = `${filename}`;
      img.width = 80;
      img.height = 80;
      img.style.borderRadius = "8px";
  
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "demoImage";
      radio.value = filename;
      radio.id = `demo-${index}`;
      if (index === 0) radio.checked = true;
  
      const label = document.createElement("label");
      label.htmlFor = radio.id;
      label.innerText = filename;
      label.style.fontsize = '10px'
  
      container.appendChild(img);
      container.appendChild(document.createElement("br"));
      container.appendChild(radio);
      container.appendChild(label);
  
      grid.appendChild(container);
    });
  }

  async function predictFromDemo() {
    const selectedRadio = document.querySelector('input[name="demoImage"]:checked');
    const selectedModel = document.getElementById("modelSelect").value;
  
    if (!selectedRadio) {
      alert("Please select a demo image.");
      return;
    }
  
    const filename = selectedRadio.value;
  
    const response = await fetch(filename);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append("model", selectedModel);
    formData.append("image", blob, filename);
  
    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      const label = data.class || data.level || "Unknown";
      const conf = data.confidence || data.probability || 0;
      document.getElementById("result").innerText =
        `Class: ${label}, Confidence: ${conf.toFixed(2)}`;
  
    } catch (err) {
      document.getElementById("result").innerText = "Prediction failed!";
      console.error("Prediction error:", err);
    }
  }

  
  function useDemo() {
    const filename = document.getElementById("demoSelector").value;
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 100;
      canvas.height = 100;
  
      const short = Math.min(img.width, img.height);
      const sx = (img.width - short) / 2;
      const sy = (img.height - short) / 2;
      ctx.drawImage(img, sx, sy, short, short, 0, 0, 100, 100);
  
      classifyImage(); 
    };
    img.src = `${filename}`; 
  }