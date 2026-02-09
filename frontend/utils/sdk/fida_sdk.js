class FacialLivelinessDetection extends HTMLElement {
  constructor() {
    super();
    const server_url = this.getAttribute("server_url") || "http://localhost:5000"; // Set default value if not provided

    this.loadScript("https://code.jquery.com/jquery-3.7.1.min.js", "sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=", "anonymous", () => {
      console.log("jQuery loaded successfully");
    });

    this.loadScript(
      "https://cdn.socket.io/4.7.2/socket.io.min.js",
      "sha384-mZLF4UVrpi/QTWPA7BjNPEnkIfRFn4ZEO3Qt/HFklTJBj/gBOV8G3HcKn4NfQblz",
      "anonymous",
      () => {
        console.log("Socket.IO loaded successfully");
      },
    );

    // this.loadBootstrap('https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css', 'sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh', 'anonymous', () => {
    //     console.log('CSS loaded successfully');
    // });

    this.insertHTMLIntoBody();
    this.loadCSS();
    // this.flashRandomColors();
  }

  loadScript(src, integrity, crossorigin, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.integrity = integrity;
    script.crossOrigin = crossorigin;
    script.onload = callback;
    script.onerror = () => console.error(`Failed to load script: ${src}`);
    document.head.appendChild(script);
  }

  loadBootstrap(href, integrity, crossorigin, callback) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.integrity = integrity;
    link.crossOrigin = crossorigin;
    link.onload = callback;
    link.onerror = () => console.error(`Failed to load CSS: ${href}`);
    document.head.appendChild(link);
  }

  async loadCSS() {
    try {
      let styleEl = document.createElement("style");
      styleEl.innerHTML = `
            /** {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }*/

            .liveliness_container {
                max-width: 500px;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }

            .liveliness_container h1 {
                font-size: 25px;
                color: #333;
                margin-bottom: 20px;
                font-family: 'Poppins', sans-serif;
                font-weight: bold;
            }

            .capture-container {
                position: relative;
                width: 248px;
                height: 336px;
                margin: 0 auto 20px;
                border: 2px solid rgb(85, 75, 75);
                border-radius: 50%;
                overflow: hidden;
            }

            #videoElement {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .button-container {
                display: flex;
                justify-content: center;
            }

            .capture-button,
            .retake-button {
                padding: 10px 20px;
                font-size: 16px;
                border-radius: 4px;
                border: none;
                background-color: #4CAF50;
                color: #fff;
                cursor: pointer;
                transition: background-color 0.3s;
            }

            .retake-button {
                background-color: #007BFF;
                margin-left: 10px;
            }

            .button-container .spinner {
                margin-left: 10px;
                font-size: 20px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }

            @media (max-width: 600px) {
                .liveliness_container {
                    padding: 10px;
                }

                .capture-container {
                    width: 100%;
                    height: auto;
                    padding-top: 100%;
                    margin-bottom: 10px;
                }
            }
            `;
      document.head.appendChild(styleEl);
      console.log("Custom CSS loaded successfully");
    } catch (error) {
      console.error("Error loading CSS:", error);
    }
  }

  async autoplayVideo(token, server_url, client_uuid, user_uuid) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.getElementById("videoElement");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      videoElement.srcObject = stream;

      canvas.width = 600;
      canvas.height = 450;

      let primary_info = "";
      let secondary_info = "";

      // Mirror the video horizontally
      videoElement.style.transform = "scaleX(-1)";

      function captureAndSendFrame(event) {
        context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, canvas.width, canvas.height);
        let imageDataURL = canvas.toDataURL("image/jpeg", 1);

        switch (event) {
          case "send_face_frame":
            socket.emit("face_frame_data", imageDataURL, client_uuid, user_uuid);
            break;
          case "send_emotion_frame":
            socket.emit("emotion_frame_data", imageDataURL);
            break;
          case "send_blinking_frame":
            socket.emit("blinking_frame_data", imageDataURL);
            break;
        }
      }

      const socket = io(server_url, {
        query: {
          token: token,
          client_uuid: client_uuid,
          user_uuid: user_uuid,
        },
      });

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socket.on("server_command", (data) => {
        if (data === "send_face_frame") {
          console.log("Sending face frame to server");
          setTimeout(() => {
            captureAndSendFrame("send_face_frame");
          }, 100);
        }

        if (data === "send_emotion_frame") {
          console.log("Sending emotion frame to server");
          setTimeout(() => {
            captureAndSendFrame("send_emotion_frame");
          }, 100);
        }

        if (data === "send_blinking_frame") {
          console.log("Sending blinking frame to server");
          setTimeout(() => {
            captureAndSendFrame("send_blinking_frame");
          }, 100);
        }

        if (data === "disconnect") {
          console.log("Disconnecting on server request");
          socket.disconnect();
        }
      });

      socket.on("face_recognized", (data) => {
        const user_identifying_info = data;
        // console.log("INFO---------", user_identifying_info);
        const face_recognized_event = new CustomEvent("face_recognized_event", { detail: user_identifying_info });
        this.dispatchEvent(face_recognized_event);
      });

      socket.on("emotion_recognition", (data) => {
        secondary_info = data;
        $("#secondary_info_container").html(secondary_info);
      });

      socket.on("blink_recognition", (data) => {
        secondary_info = data;
        $("#secondary_info_container").html(secondary_info);
      });

      socket.on("emotion_recognition_success", (data) => {
        secondary_info = "<span style='color: #4CAF50;'> " + data + "</span>";
        $("#secondary_info_container").html(secondary_info);
      });

      socket.on("blink_recognition_success", (data) => {
        secondary_info = "<span style='color: #4CAF50;'> " + data + "</span>";
        $("#secondary_info_container").html(secondary_info);
      });

      socket.on("auth_failed", (data) => {
        primary_info = "<span style='color: ##FF2E2E;'> " + data + "</span>";
        // $("#primary_info_container").html(primary_info);

        const auth_failed_event = new CustomEvent("auth_failed_event");
        this.dispatchEvent(auth_failed_event);
      });

      socket.on("auth_complete", (data) => {
        const key = data.auth_token;
        const auth_token = { auth_token: key };
        const auth_complete_event = new CustomEvent("auth_complete_event", { detail: auth_token });
        this.dispatchEvent(auth_complete_event);
      });
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  }

  flashRandomColors() {
    setInterval(() => {
      const randomColor = this.getRandomColor();
      this.flashColor(randomColor, 4, 90, 1500);
    }, 1500);
  }

  flashColor(color, flashes, interval, duration) {
    let count = 0;
    const flashInterval = setInterval(() => {
      this.style.backgroundColor = count % 2 === 0 ? color : "#FFFFFF"; // alternate between color and white
      count++;
      if (count === flashes * 2) {
        clearInterval(flashInterval);
        setTimeout(() => {
          this.style.backgroundColor = "#FFFFFF"; // reset to white after flashing
        }, interval);
      }
    }, interval);
    setTimeout(() => {
      clearInterval(flashInterval);
      this.style.backgroundColor = "#FFFFFF"; // ensure background is white after specified duration
    }, duration);
  }

  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  insertHTMLIntoBody() {
    let htmlMarkup = `
            <div class="liveliness_container" id="liveliness_container">
                <p id="top_info_container"></p>
                <div id="videoContainer" class="capture-container">
                    <video id="videoElement" autoplay muted playsinline></video>
                </div>
                <div id="flashingColors"></div> <!-- Container for flashing colors -->
                <p id="primary_info_container"></p>
                <p id="secondary_info_container"></p>
                
            </div>
        `;
    this.innerHTML = htmlMarkup;

    const self = this;
    document.addEventListener("liveliness_start_event", function (event) {
      const token = event.detail.token;
      const server_url = event.detail.server_url || "http://localhost:5000";
      const client_uuid = event.detail.client_uuid;
      const user_uuid = event.detail.user_uuid;

      self.autoplayVideo(token, server_url, client_uuid, user_uuid);
    });
  }
}

customElements.define("facial-liveliness-detection", FacialLivelinessDetection);
