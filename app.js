const $ = (id) => document.getElementById(id);
const demoSongs = [
  {title:"Neon Heartbeat",artist:"The Midnight Kids",playlist:"pop",hint:"The title mentions a glowing city light and a pulse.",year:"2021"},
  {title:"Paper Moons",artist:"Luna Park",playlist:"pop",hint:"Think of something you might see in the night sky, made from paper.",year:"2020"},
  {title:"Sugar Rush",artist:"Cherry Arcade",playlist:"pop",hint:"A sweet treat plus a burst of energy.",year:"2019"},
  {title:"Last Call Summer",artist:"June Avenue",playlist:"pop",hint:"A season is ending, and this might be the final drink.",year:"2022"},
  {title:"Digital Daydream",artist:"Static Bloom",playlist:"throwbacks",hint:"A fantasy that happens in front of a screen.",year:"2008"},
  {title:"Midnight Polaroid",artist:"The Weekend Plans",playlist:"throwbacks",hint:"A late hour and an old instant photo.",year:"2006"},
  {title:"Backseat Cinema",artist:"Velvet Weekend",playlist:"throwbacks",hint:"A movie theatre, but you're sitting behind the driver.",year:"2004"},
  {title:"Satellite Summer",artist:"Ocean Avenue",playlist:"throwbacks",hint:"Something that orbits Earth meets a hot season.",year:"2009"},
  {title:"Wildflower Static",artist:"Quiet Weather",playlist:"indie",hint:"A delicate bloom plus the crackle of radio interference.",year:"2023"},
  {title:"Caffeine & Ghosts",artist:"Bedroom Atlas",playlist:"indie",hint:"A morning pick-me-up and something spooky.",year:"2022"},
  {title:"Blue Hour",artist:"Slow Motion Club",playlist:"indie",hint:"The twilight period just after sunset or before sunrise.",year:"2021"},
  {title:"The Long Way Home",artist:"Paper Satellites",playlist:"indie",hint:"The route back takes a little longer.",year:"2020"}
];
const playlistNames = {pop:"Pop chaos",throwbacks:"Throwback hours",indie:"Alt & indie"};
let songs = [...demoSongs], roundSongs = [], roundIndex = 0, scores = [0,0], players = ["Cait","Cece"], roundLimit = 10, activePlayer = 0, usedHint = false, scoredThisRound = false, importedSongs = [];
let audioUrls = new Map();

function normalize(s){return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function setMessage(msg){$("setup-message").textContent=msg;}
function selectedPlaylists(){return [...document.querySelectorAll('#playlist-list input[type="checkbox"]:checked')].map(x=>x.value);}
function updatePlaylistCards(){
  document.querySelectorAll(".playlist-card").forEach(card=>{const input=card.querySelector("input");card.classList.toggle("selected",input.checked);});
  const count=selectedPlaylists().length;$("selected-count").textContent=`${count} selected`;
}
document.querySelectorAll('#playlist-list input[type="checkbox"]').forEach(el=>el.addEventListener("change",updatePlaylistCards));

function startGame(){
  players=[$("player-one").value.trim()||"Player One",$("player-two").value.trim()||"Player Two"];
  roundLimit=Number($("round-count").value)||10;
  const chosen=selectedPlaylists();
  if(!chosen.length){setMessage("Choose at least one playlist to play.");return;}
  const pool=songs.filter(s=>chosen.includes(s.playlist));
  if(!pool.length){setMessage("No songs found in those playlists. Import some songs or select a demo playlist.");return;}
  roundSongs=shuffle(pool).slice(0,Math.min(roundLimit,pool.length));
  if(roundSongs.length<roundLimit) roundLimit=roundSongs.length;
  roundIndex=0;scores=[0,0];activePlayer=0;
  $("setup-panel").classList.add("hidden");$("results-panel").classList.add("hidden");$("game-panel").classList.remove("hidden");
  $("score-name-one").textContent=players[0];$("score-name-two").textContent=players[1];
  $("avatar-one").textContent=players[0].charAt(0).toUpperCase();$("avatar-two").textContent=players[1].charAt(0).toUpperCase();
  renderRound();
}
function currentSong(){return roundSongs[roundIndex];}
function renderRound(){
  const s=currentSong();usedHint=false;scoredThisRound=false;
  $("round-label").textContent=`ROUND ${String(roundIndex+1).padStart(2,"0")} / ${roundLimit}`;
  $("turn-number").textContent=String(roundIndex+1).padStart(2,"0");
  $("current-player").textContent=players[activePlayer];
  $("turn-helper").textContent=`${players[activePlayer]}, lock in your guess.`;
  $("progress-fill").style.width=`${((roundIndex+1)/roundLimit)*100}%`;
  $("title-guess").value="";$("artist-guess").value="";
  $("mystery-title").textContent="??? — ???";
  $("audio-status").textContent=s.audioUrl?"Audio attached — listen and guess!":"No audio attached. Use the demo round to test hints and scoring.";
  $("audio-player").classList.toggle("hidden",!s.audioUrl);
  if(s.audioUrl){$("audio-player").src=s.audioUrl;$("audio-player").load();}
  else {$("audio-player").removeAttribute("src");$("audio-player").load();}
  $("hint-text").classList.add("hidden");$("hint-text").textContent="";
  $("feedback").classList.add("hidden");$("after-guess").classList.add("hidden");
  $("title-guess").disabled=false;$("artist-guess").disabled=false;
  $("submit-guess").disabled=false;$("hint-button").disabled=false;
  updateScores();
}
function updateScores(){
  $("score-one").innerHTML=`${scores[0]} <em>pts</em>`;$("score-two").innerHTML=`${scores[1]} <em>pts</em>`;
}
function revealHint(){
  const s=currentSong();
  if(!usedHint){$("hint-text").textContent=`HINT: ${s.hint||`This track is from ${playlistNames[s.playlist]||s.playlist}.`}${s.year?` Release year: ${s.year}.`:""}`;$("hint-text").classList.remove("hidden");usedHint=true;$("hint-button").disabled=true;}
}
function submitGuess(){
  if(scoredThisRound)return;
  const s=currentSong(), tg=normalize($("title-guess").value), ag=normalize($("artist-guess").value);
  if(!tg){$("feedback").textContent="Type a song title guess first."; $("feedback").classList.remove("hidden");return;}
  const titleCorrect=tg===normalize(s.title);
  const artistCorrect=ag && ag===normalize(s.artist);
  let points=0;
  if(titleCorrect) points+=usedHint?1:2;
  if(artistCorrect) points+=1;
  scores[activePlayer]+=points;scoredThisRound=true;
  $("feedback").textContent=titleCorrect?(artistCorrect?"NAILED IT — title and artist!":`Correct title! ${artistCorrect===false?"Artist didn't match.":""}`):(artistCorrect?"Artist is right, but the title isn't.":"Not quite — better luck next round.");
  $("feedback").classList.remove("hidden");
  $("answer-line").textContent=`${s.title} — ${s.artist}`;
  $("points-line").textContent=`+${points} point${points===1?"":"s"} for ${players[activePlayer]}${usedHint?" (hint used)":""}`;
  $("after-guess").classList.remove("hidden");
  $("title-guess").disabled=true;$("artist-guess").disabled=true;$("submit-guess").disabled=true;$("hint-button").disabled=true;
  updateScores();
}
function nextRound(){
  if(roundIndex+1>=roundLimit){showResults();return;}
  roundIndex++;activePlayer=1-activePlayer;renderRound();
}
function showResults(){
  $("game-panel").classList.add("hidden");$("results-panel").classList.remove("hidden");
  let winnerText;
  if(scores[0]===scores[1])winnerText="It's a tie. The playlist wins.";
  else winnerText=`${players[scores[0]>scores[1]?0:1]} takes the crown.`;
  $("winner-heading").textContent=winnerText;$("winner-copy").textContent=`${roundLimit} rounds. One very loud friendship.`;
  const order=[0,1].sort((a,b)=>scores[b]-scores[a]);
  $("final-scores").innerHTML=order.map((i,rank)=>`<div class="final-score-card ${rank===0&&scores[0]!==scores[1]?"winner":""}"><small>${escapeHTML(players[i])}${rank===0&&scores[0]!==scores[1]?" · WINNER":""}</small><strong>${scores[i]} <small>pts</small></strong></div>`).join("");
}
function quitGame(){ $("game-panel").classList.add("hidden");$("setup-panel").classList.remove("hidden"); }
function playAgain(){ $("results-panel").classList.add("hidden");$("setup-panel").classList.remove("hidden"); }
function parseCSV(text){
  const rows=[];let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i++;}else if(c==='"'){quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";}else cell+=c;}
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
  if(rows.length<2)throw new Error("CSV needs a header row and at least one song.");
  const headers=rows.shift().map(h=>h.trim().toLowerCase());
  const ti=headers.indexOf("title"),ai=headers.indexOf("artist"),pi=headers.indexOf("playlist"),hi=headers.indexOf("hint"),yi=headers.indexOf("year");
  if(ti<0||ai<0||pi<0)throw new Error("CSV must include title, artist, and playlist columns.");
  return rows.map(r=>({title:(r[ti]||"").trim(),artist:(r[ai]||"").trim(),playlist:(r[pi]||"").trim(),hint:hi>=0?(r[hi]||"").trim():"",year:yi>=0?(r[yi]||"").trim():""})).filter(s=>s.title&&s.artist&&s.playlist);
}
function rebuildPlaylists(){
  const custom=[...new Set(importedSongs.map(s=>s.playlist))];
  const existing=new Set([...document.querySelectorAll('#playlist-list input')].map(x=>x.value));
  custom.filter(p=>!existing.has(p)).forEach((p,index)=>{
    const key=`custom-${index}-${p}`;const label=document.createElement("label");label.className="playlist-card selected";
    label.innerHTML=`<input type="checkbox" checked value="${escapeHTML(key)}"><span class="playlist-art art-green">MIX</span><span class="playlist-info"><strong>${escapeHTML(p)}</strong><small>Imported playlist</small></span><span class="checkmark">✓</span>`;
    // Store the actual playlist label separately, avoiding assumptions about user text.
    label.querySelector("input").dataset.playlistLabel=p;
    $("playlist-list").appendChild(label);
    label.querySelector("input").addEventListener("change",updatePlaylistCards);
  });
  // Keep the key-to-label mapping in data attributes for filtering.
  document.querySelectorAll('#playlist-list input').forEach(input=>{if(!input.dataset.playlistLabel)input.dataset.playlistLabel=input.value;});
  updatePlaylistCards();
}
$("csv-input").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{importedSongs=parseCSV(await file.text());if(!importedSongs.length)throw new Error("No valid songs found.");
    // Add imported playlist cards and include imported tracks in the session library.
    songs=[...demoSongs,...importedSongs.map(s=>({...s,playlist:`custom:${s.playlist}`}))];
    const names=[...new Set(importedSongs.map(s=>s.playlist))];
    names.forEach((name,index)=>{
      const value=`custom:${name}`;if(document.querySelector(`#playlist-list input[value="${CSS.escape(value)}"]`))return;
      const label=document.createElement("label");label.className="playlist-card selected";
      label.innerHTML=`<input type="checkbox" checked><span class="playlist-art art-green">MIX</span><span class="playlist-info"><strong>${escapeHTML(name)}</strong><small>Imported playlist · ${importedSongs.filter(s=>s.playlist===name).length} tracks</small></span><span class="checkmark">✓</span>`;
      const input=label.querySelector("input");input.value=value;input.addEventListener("change",updatePlaylistCards);$("playlist-list").appendChild(label);
    });
    updatePlaylistCards();setMessage(`Imported ${importedSongs.length} songs from ${names.length} playlist(s). They stay in this page session only.`);
  }catch(err){setMessage(`Import failed: ${err.message}`);}
  e.target.value="";
});
$("audio-input").addEventListener("change",e=>{
  const file=e.target.files[0];if(!file)return;
  const s=currentSong();if(s.audioUrl)URL.revokeObjectURL(s.audioUrl);
  s.audioUrl=URL.createObjectURL(file);$("audio-player").src=s.audioUrl;$("audio-player").classList.remove("hidden");$("audio-player").load();
  $("audio-status").textContent=`Attached locally: ${file.name}`;e.target.value="";
});
$("download-template").addEventListener("click",()=>{
  const csv='title,artist,playlist,hint,year\n"Example Song","Example Artist","My Playlist","A clue about the title",2024\n';
  const blob=new Blob([csv],{type:"text/csv"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="song-game-template.csv";a.click();URL.revokeObjectURL(url);
});
$("start-game").addEventListener("click",startGame);
$("hint-button").addEventListener("click",revealHint);
$("submit-guess").addEventListener("click",submitGuess);
$("next-round").addEventListener("click",nextRound);
$("quit-game").addEventListener("click",quitGame);
$("play-again").addEventListener("click",playAgain);
["title-guess","artist-guess"].forEach(id=>$(id).addEventListener("keydown",e=>{if(e.key==="Enter"&&!$("submit-guess").disabled)submitGuess();}));
updatePlaylistCards();
