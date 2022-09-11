document
  .querySelector("#fileUploadForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    let fd = new FormData();

    fd.append("file", document.querySelector("#fileInput").files[0]);

    try {
      const res = axios.post("http://localhost:3002/upload", fd, {
        headers: {
          Authorization: socket.id,
        },
      });
      log(res.data.data.message, res.data.data.status);
    } catch (err) {
      console.error(err);
      log(err.response.data.message, err.response.data.status);
    }
  });

const updateList = document.querySelector("#updateList");
function log(message, type) {
  let item = document.createElement("li");
  item.className = "list-group-item";
  item.innerHTML = message;
  item.style.color =
    type === "success"
      ? "green"
      : type === "error"
      ? "red"
      : type === "info"
      ? "blue"
      : "lightgray";
  updateList.appendChild(item);
}

socket.on("statusUpdate", (data) => {
  log(data.message, data.status);
});
