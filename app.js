const START_WEIGHT = 73;
const TARGET_WEIGHT = 89;
const PROTEIN_TARGET = 170;

const workouts = {
  "Day 1 - Upper Width": [
    ["Incline DB Press", "6-10", "Set 1: 1 RIR | Set 2: technical failure"],
    ["Neutral Grip Lat Pulldown", "8-12", "Weighted pull-up replacement"],
    ["Chest Supported Row", "8-12", "Upper back thickness"],
    ["Cable Lateral Raise", "12-15", "Both sets to technical failure"],
    ["Face Pull", "12-15", "Rear delts / shoulder health"],
    ["Hammer Curl", "10-12", "Brachialis / arm thickness"]
  ],
  "Day 2 - Lower Mass": [
    ["Hack Squat", "6-10", "Quads / total leg size"],
    ["Romanian Deadlift", "8-10", "Hamstrings / glutes"],
    ["Leg Press", "10-15", "High-output leg mass"],
    ["Leg Curl", "10-15", "Both sets to technical failure"],
    ["Standing Calf Raise", "12-20", "Controlled stretch and squeeze"]
  ],
  "Day 3 - Push": [
    ["Smith Incline Press", "6-10", "Upper chest priority"],
    ["Seated DB Shoulder Press", "8-10", "Shoulder mass"],
    ["Machine Chest Press", "8-12", "Safe failure pressing"],
    ["Cable Lateral Raise", "12-15", "Width builder"],
    ["Overhead Triceps Extension", "10-15", "Long-head triceps"]
  ],
  "Day 4 - Pull": [
    ["Wide Grip Lat Pulldown", "8-12", "Lat width"],
    ["Seated Cable Row", "8-12", "Mid-back thickness"],
    ["Shrugs", "10-15", "Traps"],
    ["Rear Delt Fly", "12-15", "Rear delts"],
    ["EZ Curl", "10-12", "Biceps"]
  ],
  "Day 5 - Specialisation": [
    ["Incline DB Press", "8-12", "Upper chest frequency"],
    ["Single Arm Lat Pulldown", "10-12", "Lat isolation"],
    ["Cable Lateral Raise", "12-15", "Side delt priority"],
    ["Close Grip Chest Press", "8-12", "Triceps / pressing power"],
    ["Hammer Curl", "10-12", "Arm thickness"],
    ["Manual Neck Isometrics", "3 x 20-30 sec", "Home-based alternative"]
  ]
};

const $ = (id) => document.getElementById(id);

function getData() {
  return JSON.parse(localStorage.getItem("projectReacher") || '{"checkins":[],"measurements":[]}');
}
function saveData(data) {
  localStorage.setItem("projectReacher", JSON.stringify(data));
}
function pct(n) {
  return Math.max(0, Math.min(100, n));
}
function renderWorkout() {
  const day = $("daySelect").value;
  $("workoutList").innerHTML = workouts[day].map((x, i) => `
    <div class="exercise">
      <h3>${i+1}. ${x[0]}</h3>
      <div class="small">Target: ${x[1]} · ${x[2]}</div>
      <div class="set-row">
        <label>Warm-up<input placeholder="Optional"></label>
        <label>Set 1<input placeholder="kg x reps"></label>
        <label>Set 2<input placeholder="kg x reps"></label>
      </div>
    </div>
  `).join("");
}
function renderDashboard() {
  const data = getData();
  const latest = data.checkins[data.checkins.length - 1];
  const weight = latest?.weight || START_WEIGHT;
  $("currentWeight").textContent = `${Number(weight).toFixed(1)}kg`;
  const progress = pct(((weight - START_WEIGHT) / (TARGET_WEIGHT - START_WEIGHT)) * 100);
  $("progressBar").style.width = `${progress}%`;
  $("progressText").textContent = `${progress.toFixed(1)}%`;

  if (data.checkins.length >= 2) {
    const prev = data.checkins[data.checkins.length - 2].weight;
    const gain = weight - prev;
    $("weeklyGain").textContent = `${gain >= 0 ? "+" : ""}${gain.toFixed(2)}kg`;
  }

  let score = 0;
  if (latest) {
    score += Math.min(25, (latest.protein / PROTEIN_TARGET) * 25);
    score += Math.min(25, (latest.sessions / 5) * 25);
    score += Math.min(25, (latest.recovery / 10) * 25);
    score += Math.min(25, (latest.energy / 10) * 25);
    $("score").textContent = `${Math.round(score)}/100`;
  }
  renderHistory();
}
function renderHistory() {
  const data = getData();
  $("history").innerHTML = data.checkins.slice().reverse().map((c, idx) => `
    <div class="history-item">
      <strong>${c.date}</strong> · ${c.weight}kg · Protein ${c.protein}g · Sessions ${c.sessions}/5<br>
      ${c.notes ? c.notes : ""}
    </div>
  `).join("") || "<p class='small'>No check-ins yet.</p>";
}

Object.keys(workouts).forEach(day => {
  const opt = document.createElement("option");
  opt.value = day;
  opt.textContent = day;
  $("daySelect").appendChild(opt);
});
$("daySelect").addEventListener("change", renderWorkout);

$("saveCheckin").addEventListener("click", () => {
  const data = getData();
  data.checkins.push({
    date: new Date().toLocaleDateString(),
    weight: Number($("weightInput").value || START_WEIGHT),
    protein: Number($("proteinInput").value || 0),
    sleep: Number($("sleepInput").value || 0),
    sessions: Number($("sessionsInput").value || 0),
    recovery: Number($("recoveryInput").value || 0),
    energy: Number($("energyInput").value || 0),
    notes: $("notesInput").value
  });
  saveData(data);
  renderDashboard();
  alert("Weekly check-in saved.");
});

$("saveMeasurements").addEventListener("click", () => {
  const data = getData();
  data.measurements.push({
    date: new Date().toLocaleDateString(),
    shoulders: $("shoulders").value,
    chest: $("chest").value,
    waist: $("waist").value,
    neck: $("neck").value,
    rarm: $("rarm").value,
    larm: $("larm").value,
    rthigh: $("rthigh").value,
    lthigh: $("lthigh").value
  });
  saveData(data);
  alert("Measurements saved.");
});

$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(getData(), null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project-reacher-data.json";
  a.click();
});

renderWorkout();
renderDashboard();
