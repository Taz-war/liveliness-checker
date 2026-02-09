function initiateLiveliness(token, server_url, client_uuid, user_uuid) {
  const liveliness_start_event = new CustomEvent("liveliness_start_event", {
    detail: {
      token: token,
      server_url: server_url,
      client_uuid: client_uuid,
      user_uuid: user_uuid,
    },
  });

  document.dispatchEvent(liveliness_start_event);
}

function setContainerHeaderInfo(topInfo) {
  $("#top_info_container").html("<span>" + topInfo + "</span>");
}

function setPrimaryInfo(primaryInfo) {
  $("#primary_info_container").html("<span>" + primaryInfo + "</span>");
}

function setSecondaryInfo(secondaryInfo) {
  $("#secondary_info_container").html("<span>" + secondaryInfo + "</span>");
}

// Functions to set up event listeners
function setupAuthFailedListener(callback) {
  document.querySelector("facial-liveliness-detection").addEventListener("auth_failed_event", callback);
}

function setupFaceRecognizedListener(callback) {
  document.querySelector("facial-liveliness-detection").addEventListener("face_recognized_event", callback);
}

function setupAuthCompleteListener(callback) {
  document.querySelector("facial-liveliness-detection").addEventListener("auth_complete_event", callback);
}
