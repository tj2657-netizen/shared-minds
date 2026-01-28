const modal = document.getElementById("my-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeBtn = document.getElementsByClassName("close-btn")[0];

openModalBtn.onclick = function() {
    modal.style.display = "block";
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
