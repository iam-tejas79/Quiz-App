const ul = document.getElementById("leaderboard-list");
const clearBtn = document.getElementById("clear-btn");
const chips = document.querySelectorAll(".chip");
const key = "quizLeaderboard";

let data = JSON.parse(localStorage.getItem(key)) || [];
data.sort((a,b) => (b.score - a.score) || (b.ts - a.ts));

let currentFilter = "all";
render();

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter; // all | html | css | js
    render();
  });
});

clearBtn.addEventListener("click", () => {
  if (confirm("Clear all leaderboard entries?")){
    localStorage.removeItem(key);
    data = [];
    render();
  }
});

function render(){
  ul.innerHTML = "";
  const filtered = data.filter(d => currentFilter === "all" ? true : d.subject === currentFilter);
  if (filtered.length === 0){
    ul.innerHTML = `<li>No entries yet.</li>`;
    return;
  }
  filtered.forEach((e, idx) => {
    const li = document.createElement("li");
    const date = new Date(e.ts).toLocaleString();
    li.innerHTML = `
      <span><strong>${idx + 1}.</strong> ${e.name}</span>
      <span class="badge">${label(e.subject)}</span>
      <span><strong>${e.score}/${e.total}</strong></span>
      <span class="badge">${date}</span>
    `;
    ul.appendChild(li);
  });
}

function label(s){
  if (s === "html") return "HTML";
  if (s === "css") return "CSS";
  return "JavaScript";
}
