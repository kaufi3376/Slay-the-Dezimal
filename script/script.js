/* --- Hilfsfunktionen --- */
function toGerman(num){return num.toString().replace(".",",");}
function fromGerman(str){return parseFloat(str.replace(",","."));}
let debug = false; // true = Lösung wird automatisch ins Inputfeld geschrieben

function toggleHint(){
    const hintBox = document.getElementById("hintBox");
    if(hintBox.style.display === "block"){
        hintBox.style.display = "none";
    } else {
        hintBox.style.display = "block";
    }
}




/* --- Globale Variablen --- */
let currentLevel = "Dorf";
let levelColors = {
    "Dorf": {
        primary: "#667eea",
        secondary: "#764ba2",
        node: "#444",
        nodeBorder: "#777",
        elite: "#8e44ad"
    },
    "Stadt": {
        primary: "#f093fb",
        secondary: "#f5576c",
        node: "#5a2a27",
        nodeBorder: "#d4a5a5",
        elite: "#e74c3c"
    }
};

let levels = [
    { count: 2, difficulty: 1 },
    { count: 3, difficulty: 2 },
    { count: 2, difficulty: 3 },
    { count: 1, difficulty: "boss" }
];
let nodes = {}, connections = {};
let currentNode = null, solution=0;
let inLevel=false, bossMaxLife=3, bossLife=3;
let playerMaxLife = 3;
let playerLife = 3;



/* --- Hilfsfunktionen --- */
function shuffleArray(array){
    for(let i=array.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function linesIntersect(a1, a2, b1, b2) {
    const det = (a2.x-a1.x)*(b2.y-b1.y) - (a2.y-a1.y)*(b2.x-b1.x);
    if(det===0) return false;
    const lambda = ((b2.y-b1.y)*(b2.x-a1.x)+(b1.x-b2.x)*(b2.y-a1.y))/det;
    const gamma  = ((a1.y-a2.y)*(b2.x-a1.x)+(a2.x-a1.x)*(b2.y-a1.y))/det;
    return (0<lambda && lambda<1) && (0<gamma && gamma<1);
}

/* --- Map & Knoten --- */
function generateConnectionsSafe(levelIds, previousLevelIds, connections) {
    const lines = [];
    previousLevelIds.forEach(prevId=>{
        const shuffledTargets = shuffleArray(levelIds);
        for(let i=0;i<shuffledTargets.length;i++){
            const toId = shuffledTargets[i];
            const fromNode = nodes[prevId];
            const toNode = nodes[toId];
            const a1 = {x:parseFloat(fromNode.style.left)+fromNode.offsetWidth/2,
                        y:parseFloat(fromNode.style.top)+fromNode.offsetHeight/2};
            const a2 = {x:parseFloat(toNode.style.left)+toNode.offsetWidth/2,
                        y:parseFloat(toNode.style.top)+toNode.offsetHeight/2};
            let intersects=false;
            for(let line of lines){
                if(linesIntersect(a1,a2,line[0],line[1])){
                    intersects=true;
                    break;
                }
            }
            if(!intersects){
                if(!connections[prevId]) connections[prevId]=[];
                connections[prevId].push(toId);
                lines.push([a1,a2]);
                break;
            }
        }
    });
    // Sicherstellen, dass jeder Knoten der aktuellen Ebene mind. 1 eingehende Verbindung hat
    levelIds.forEach(currId=>{
        if(!Object.values(connections).flat().includes(currId)){
            const shuffledPrev = shuffleArray(previousLevelIds);
            for(let prev of shuffledPrev){
                const fromNode = nodes[prev];
                const toNode = nodes[currId];
                const a1 = {x:parseFloat(fromNode.style.left)+fromNode.offsetWidth/2,
                            y:parseFloat(fromNode.style.top)+fromNode.offsetHeight/2};
                const a2 = {x:parseFloat(toNode.style.left)+toNode.offsetWidth/2,
                            y:parseFloat(toNode.style.top)+toNode.offsetHeight/2};

                let intersects=false;
                for(let line of lines){
                    if(linesIntersect(a1,a2,line[0],line[1])){
                        intersects=true;
                        break;
                    }
                }

                if(!intersects){
                    if(!connections[prev]) connections[prev]=[];
                    connections[prev].push(currId);
                    lines.push([a1,a2]);
                    break;
                }
            }
        }
    });
}

/* --- Linien zeichnen --- */
function drawLines() {
    const oldSvg = map.querySelector("svg");
    if(oldSvg) oldSvg.remove();
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.style.position="absolute"; svg.style.width="100%"; svg.style.height="100%";
    svg.style.top="0"; svg.style.left="0"; svg.style.zIndex="1";
    map.appendChild(svg);
    Object.entries(connections).forEach(([fromId, toIds]) => {
        const fromNode = nodes[fromId];
        const x1 = parseFloat(fromNode.style.left) + fromNode.offsetWidth / 2;
        const y1 = parseFloat(fromNode.style.top) + fromNode.offsetHeight / 2;
        toIds.forEach(toId=>{
            const toNode = nodes[toId];
            const x2 = parseFloat(toNode.style.left) + toNode.offsetWidth / 2;
            const y2 = parseFloat(toNode.style.top) + toNode.offsetHeight / 2;
            const line = document.createElementNS(svgNS,"line");
            line.setAttribute("x1",x1); line.setAttribute("y1",y1);
            line.setAttribute("x2",x2); line.setAttribute("y2",y2);
            line.setAttribute("stroke","#666"); line.setAttribute("stroke-width","3");
            line.setAttribute("stroke-linecap","round");
            svg.appendChild(line);
        });
    });
}

/* --- Aufgaben generieren --- */
function createTask(level){
    if(currentLevel === "Stadt"){
        // Stadt: Einfache Aufgaben mit negativen Zahlen
        // Jede Zahl bekommt eigene Nachkommastellenanzahl: 30% eine, 60% zwei, 10% drei
        const getDecimals = () => {
            const rand = Math.random();
            return rand < 0.3 ? 1 : (rand < 0.9 ? 2 : 3);
        };
        const templates = [
            // -a:(-b)
            () => {
                let a = +(Math.random()*10+1).toFixed(getDecimals());
                let b = +(Math.random()*2+0.1).toFixed(getDecimals());
                solution = parseFloat((-a/(-b)).toFixed(2));
                return `${toGerman(-a)}:(${toGerman(-b)})`;
            },
            // (-a)-(-b)
            () => {
                let a = +(Math.random()*5+0.5).toFixed(getDecimals());
                let b = +(Math.random()*5+1).toFixed(getDecimals());
                solution = parseFloat((-a-(-b)).toFixed(2));
                return `(${toGerman(-a)})-(${toGerman(-b)})`;
            },
            // -a+(-b)
            () => {
                let a = +(Math.random()*8+1).toFixed(getDecimals());
                let b = +(Math.random()*5+1).toFixed(getDecimals());
                solution = parseFloat((-a+(-b)).toFixed(2));
                return `${toGerman(-a)}+(${toGerman(-b)})`;
            },
            // (-a)*b
            () => {
                let a = +(Math.random()*5+1).toFixed(getDecimals());
                let b = +(Math.random()*3+1).toFixed(getDecimals());
                solution = parseFloat((-a*b).toFixed(2));
                return `(${toGerman(-a)})·${toGerman(b)}`;
            },
            // a*(-b)
            () => {
                let a = +(Math.random()*5+1).toFixed(getDecimals());
                let b = +(Math.random()*3+1).toFixed(getDecimals());
                solution = parseFloat((a*(-b)).toFixed(2));
                return `${toGerman(a)}·(${toGerman(-b)})`;
            }
        ];
        const template = templates[Math.floor(Math.random()*templates.length)];
        document.getElementById("taskText").innerText = template();
    } else {
        // Dorf: Einfache Aufgaben
        const ops=[{display:"+",calc:"+"},{display:"-",calc:"-"},{display:"·",calc:"*"},{display:":",calc:"/"}];
        const op=ops[Math.floor(Math.random()*ops.length)];
        // Jede Zahl bekommt eigene Nachkommastellenanzahl: 70% eine, 20% zwei, 10% drei
        const getDecimals = () => {
            const rand = Math.random();
            return rand < 0.7 ? 1 : (rand < 0.9 ? 2 : 3);
        };
        let a=+(Math.random()*level*10).toFixed(getDecimals());
        let b=+(Math.random()*level*5+1).toFixed(getDecimals());
        solution=parseFloat(eval(`${a}${op.calc}${b}`).toFixed(2));
        document.getElementById("taskText").innerText=`${toGerman(a)} ${op.display} ${toGerman(b)}`;
    }

    // Debug: Lösung direkt ins Inputfeld einfügen
    if(debug){
        document.getElementById("answer").value = solution;
    } else {
        document.getElementById("answer").value = "";
    }
}

/* --- Boss --- */
function createBossTask(){
    if(currentLevel === "Stadt"){
        // Stadt: Boss-Aufgaben mit 3 Operationen und negativen Zahlen
        // Jede Zahl bekommt eigene Nachkommastellenanzahl: 30% eine, 60% zwei, 10% drei
        const getDecimals = () => {
            const rand = Math.random();
            return rand < 0.3 ? 1 : (rand < 0.9 ? 2 : 3);
        };
        const templates = [
            // -a:(-b)+c*d
            () => {
                let a = +(Math.random()*8+2).toFixed(getDecimals());
                let b = +(Math.random()*2+0.2).toFixed(getDecimals());
                let c = +(Math.random()*5+1).toFixed(getDecimals());
                let d = +(Math.random()*3+0.5).toFixed(getDecimals());
                solution = parseFloat((-a/(-b)+c*d).toFixed(2));
                return `${toGerman(-a)}:(${toGerman(-b)})+${toGerman(c)}·${toGerman(d)}`;
            },
            // -a*b-(-c)+d
            () => {
                let a = +(Math.random()*5+1).toFixed(getDecimals());
                let b = +(Math.random()*3+0.5).toFixed(getDecimals());
                let c = +(Math.random()*8+2).toFixed(getDecimals());
                let d = +(Math.random()*6+1).toFixed(getDecimals());
                solution = parseFloat((-a*b-(-c)+d).toFixed(2));
                return `${toGerman(-a)}·${toGerman(b)}-(${toGerman(-c)})+${toGerman(d)}`;
            },
            // (-a)+b*(-c)-d
            () => {
                let a = +(Math.random()*8+2).toFixed(getDecimals());
                let b = +(Math.random()*4+1).toFixed(getDecimals());
                let c = +(Math.random()*2+0.5).toFixed(getDecimals());
                let d = +(Math.random()*5+1).toFixed(getDecimals());
                solution = parseFloat(((-a)+b*(-c)-d).toFixed(2));
                return `(${toGerman(-a)})+${toGerman(b)}·(${toGerman(-c)})-${toGerman(d)}`;
            },
            // -a:(-b)-c+d
            () => {
                let a = +(Math.random()*10+2).toFixed(getDecimals());
                let b = +(Math.random()*2+0.3).toFixed(getDecimals());
                let c = +(Math.random()*6+1).toFixed(getDecimals());
                let d = +(Math.random()*8+1).toFixed(getDecimals());
                solution = parseFloat((-a/(-b)-c+d).toFixed(2));
                return `${toGerman(-a)}:(${toGerman(-b)})-${toGerman(c)}+${toGerman(d)}`;
            },
            // (-a)*(-b)-c+d
            () => {
                let a = +(Math.random()*5+1).toFixed(getDecimals());
                let b = +(Math.random()*3+0.5).toFixed(getDecimals());
                let c = +(Math.random()*8+2).toFixed(getDecimals());
                let d = +(Math.random()*5+1).toFixed(getDecimals());
                solution = parseFloat(((-a)*(-b)-c+d).toFixed(2));
                return `(${toGerman(-a)})·(${toGerman(-b)})-${toGerman(c)}+${toGerman(d)}`;
            }
        ];
        const template = templates[Math.floor(Math.random()*templates.length)];
        document.getElementById("taskText").innerText=`👑 Bosskampf: ${template()}`;
    } else {
        // Dorf: Boss-Aufgaben mit 2 Operationen (1 Nachkommastelle)
        // Jede Zahl bekommt eigene Nachkommastellenanzahl: 70% eine, 20% zwei, 10% drei
        const getDecimals = () => {
            const rand = Math.random();
            return rand < 0.7 ? 1 : (rand < 0.9 ? 2 : 3);
        };
        const templates = [
            // a * b + c
            () => {
                let a = +(Math.random()*10+5).toFixed(getDecimals());
                let b = +(Math.random()*5+2).toFixed(getDecimals());
                let c = +(Math.random()*20+5).toFixed(getDecimals());
                solution = parseFloat((a*b+c).toFixed(2));
                return `${toGerman(a)} · ${toGerman(b)} + ${toGerman(c)}`;
            },
            // a * b - c
            () => {
                let a = +(Math.random()*15+5).toFixed(getDecimals());
                let b = +(Math.random()*5+2).toFixed(getDecimals());
                let c = +(Math.random()*20+5).toFixed(getDecimals());
                solution = parseFloat((a*b-c).toFixed(2));
                return `${toGerman(a)} · ${toGerman(b)} - ${toGerman(c)}`;
            },
            // a : b + c
            () => {
                let a = +(Math.random()*50+20).toFixed(getDecimals());
                let b = +(Math.random()*5+2).toFixed(getDecimals());
                let c = +(Math.random()*15+5).toFixed(getDecimals());
                solution = parseFloat((a/b+c).toFixed(2));
                return `${toGerman(a)} : ${toGerman(b)} + ${toGerman(c)}`;
            },
            // a + b * c
            () => {
                let a = +(Math.random()*20+10).toFixed(getDecimals());
                let b = +(Math.random()*8+2).toFixed(getDecimals());
                let c = +(Math.random()*5+2).toFixed(getDecimals());
                solution = parseFloat((a+b*c).toFixed(2));
                return `${toGerman(a)} + ${toGerman(b)} · ${toGerman(c)}`;
            },
            // a - b * c
            () => {
                let a = +(Math.random()*50+20).toFixed(getDecimals());
                let b = +(Math.random()*8+2).toFixed(getDecimals());
                let c = +(Math.random()*5+2).toFixed(getDecimals());
                solution = parseFloat((a-b*c).toFixed(2));
                return `${toGerman(a)} - ${toGerman(b)} · ${toGerman(c)}`;
            }
        ];
        const template = templates[Math.floor(Math.random()*templates.length)];
        document.getElementById("taskText").innerText=`👑 Bosskampf: ${template()}`;
    }
    
    document.getElementById("bossBar").style.display="block";
    updateItemBarVisibility();
    updateBossBar();

    // Debug: Lösung direkt ins Inputfeld einfügen
    if(debug){
        document.getElementById("answer").value = toGerman(solution);
    } else {
        document.getElementById("answer").value = "";
    }
}
function updateBossBar(){
    const percent=(bossLife/bossMaxLife)*100;
    document.getElementById("bossLife").style.width=percent+"%";
    document.getElementById("bossLifeText").innerText=`👑 Boss-Leben: ${bossLife} / ${bossMaxLife}`;
}

/* --- Spieler --- */
function updatePlayerBar(){
    const percent = (playerLife/playerMaxLife)*100;
    document.getElementById("playerLife").style.width = percent + "%";
    document.getElementById("playerLifeText").innerText = `💙 Spieler-Leben: ${playerLife} / ${playerMaxLife}`;
}

/* --- Elite --- */
function createEliteTask(node){
    if(currentLevel === "Stadt"){
        // Stadt: Mittelmaß zwischen Stadt und Boss - 2-3 Operationen mit negativen Zahlen
        // Jede Zahl bekommt eigene Nachkommastellenanzahl: 30% eine, 60% zwei, 10% drei
        const getDecimals = () => {
            const rand = Math.random();
            return rand < 0.3 ? 1 : (rand < 0.9 ? 2 : 3);
        };
        const templates = [
            // -a:(-b)+c
            () => {
                let a = +(Math.random()*10+2).toFixed(getDecimals());
                let b = +(Math.random()*2+0.2).toFixed(getDecimals());
                let c = +(Math.random()*8+1).toFixed(getDecimals());
                solution = parseFloat((-a/(-b)+c).toFixed(2));
                return `${toGerman(-a)}:(${toGerman(-b)})+${toGerman(c)}`;
            },
            // -a*b-(-c)
            () => {
                let a = +(Math.random()*6+1).toFixed(getDecimals());
                let b = +(Math.random()*3+0.5).toFixed(getDecimals());
                let c = +(Math.random()*8+2).toFixed(getDecimals());
                solution = parseFloat((-a*b-(-c)).toFixed(2));
                return `${toGerman(-a)}·${toGerman(b)}-(${toGerman(-c)})`;
            },
            // (-a)+b*(-c)
            () => {
                let a = +(Math.random()*8+2).toFixed(getDecimals());
                let b = +(Math.random()*5+1).toFixed(getDecimals());
                let c = +(Math.random()*3+0.5).toFixed(getDecimals());
                solution = parseFloat(((-a)+b*(-c)).toFixed(2));
                return `(${toGerman(-a)})+${toGerman(b)}·(${toGerman(-c)})`;
            },
            // -a:(-b)-c
            () => {
                let a = +(Math.random()*12+2).toFixed(getDecimals());
                let b = +(Math.random()*3+0.3).toFixed(getDecimals());
                let c = +(Math.random()*8+1).toFixed(getDecimals());
                solution = parseFloat((-a/(-b)-c).toFixed(2));
                return `${toGerman(-a)}:(${toGerman(-b)})-${toGerman(c)}`;
            },
            // (-a)*(-b)+c
            () => {
                let a = +(Math.random()*5+1).toFixed(getDecimals());
                let b = +(Math.random()*3+0.5).toFixed(getDecimals());
                let c = +(Math.random()*10+2).toFixed(getDecimals());
                solution = parseFloat(((-a)*(-b)+c).toFixed(2));
                return `(${toGerman(-a)})·(${toGerman(-b)})+${toGerman(c)}`;
            },
            // a-(-b)*c
            () => {
                let a = +(Math.random()*10+5).toFixed(getDecimals());
                let b = +(Math.random()*4+1).toFixed(getDecimals());
                let c = +(Math.random()*3+1).toFixed(getDecimals());
                solution = parseFloat((a-(-b)*c).toFixed(2));
                return `${toGerman(a)}-(${toGerman(-b)})·${toGerman(c)}`;
            }
        ];
        const template = templates[Math.floor(Math.random()*templates.length)];
        document.getElementById("taskText").innerText=`👾 Elite: ${template()}`;
    } else {
        // Dorf: Einfache Elite-Aufgaben
        const ops=[{display:"+",calc:"+"},{display:"-",calc:"-"},{display:"·",calc:"*"},{display:":",calc:"/"}];
        const op=ops[Math.floor(Math.random()*ops.length)];
        let level = 3;
        // Jede Zahl bekommt eigene Nachkommastellenanzahl: 70% eine, 20% zwei, 10% drei
        const getDecimals = () => {
            const rand = Math.random();
            return rand < 0.7 ? 1 : (rand < 0.9 ? 2 : 3);
        };
        let a=+(Math.random()*level*10).toFixed(getDecimals());
        let b=+(Math.random()*level*5+1).toFixed(getDecimals());
        solution=parseFloat(eval(`${a}${op.calc}${b}`).toFixed(2));
        document.getElementById("taskText").innerText=`👾 Elite: ${toGerman(a)} ${op.display} ${toGerman(b)}`;
    }
    
    document.getElementById("taskBox").style.display="block";
    document.getElementById("eliteBar").style.display = "block";
    updateItemBarVisibility();
    updateEliteBar(node);
    inLevel=true;

    // Debug: Lösung direkt ins Inputfeld einfügen
    if(debug){
        document.getElementById("answer").value = toGerman(solution);
    } else {
        document.getElementById("answer").value = "";
    }
}
function updateEliteBar(node){
    const percent = (node.eliteCurrentLife / node.eliteLife)*100;
    const bar = document.getElementById("eliteLife");
    bar.style.width = percent + "%";
    document.getElementById("eliteLifeText").innerText = `👾 ${node.eliteCurrentLife} / ${node.eliteLife}`;
}

/* --- Knoten aktivieren & Klicklogik --- */
function activateNodes(){
    Object.values(nodes).forEach(node=>{
        node.onclick=()=>{
            if(inLevel) return;
            if(node.classList.contains("locked")||node.classList.contains("completed")) return;
            startTimer();
            inLevel=true; currentNode=node;

            // Sperre alle Knoten der Reihe
            const row=[...Object.values(nodes)].filter(n=>{
                return Math.abs(parseFloat(n.style.top)-parseFloat(node.style.top))<5;
            });
            row.forEach(n=>{
                if(n!==node){ n.classList.add("locked"); n.style.pointerEvents="none"; }
            });
            node.style.pointerEvents="none";

            document.getElementById("taskBox").style.display="block";
            document.getElementById("feedback").innerText="";

            if(node.classList.contains("elite")){
                node.eliteCurrentLife = node.eliteLife; // 2 Leben setzen
                createEliteTask(node); // Healthbar anzeigen & Aufgabe generieren
            } else if(node.classList.contains("boss")){
                createBossTask();
            } else {
                createTask(parseInt(node.innerText));
                updateItemBarVisibility();
            }
        };
    });


}

/* --- Antwort prüfen --- */
function checkAnswer(){
    const user = fromGerman(document.getElementById("answer").value);

    if(Math.abs(user-solution)<0.01){
        if(currentNode.classList.contains("boss")){
            bossLife--; updateBossBar();
            if(bossLife>0){ createBossTask(); return;}
            else {
                document.getElementById("bossBar").style.display="none";
                stopTimer(); // Timer stoppen
                const elapsedTime = getElapsedTime(); // Timer stoppen/erhalten
                document.getElementById("bossTime").innerText = elapsedTime; // ✅ hier einfügen
                
                // Submessage nur im Dorf anzeigen, im Stadt andere Nachricht
                if(currentLevel === "Dorf"){
                    document.getElementById("victoryTitle").innerText = "🎉 Boss besiegt! 🎉";
                    document.getElementById("victoryMessage").innerText = "Du hast das Dorf befreit!";
                    document.getElementById("victorySubMessage").innerText = "Gehe weiter in die Stadt";
                    document.getElementById("victorySubMessage").style.display = "block";
                } else if(currentLevel === "Stadt"){
                    document.getElementById("victoryTitle").innerText = "🎉 Stadt befreit! 🎉";
                    document.getElementById("victoryMessage").innerText = "Du hast alle Herausforderungen gemeistert!";
                    document.getElementById("victorySubMessage").innerText = "Du hast dir einen Lobschein verdient! Zeige einen Screenshot deinem Lehrer";
                    document.getElementById("victorySubMessage").style.display = "block";
                }
                
                bossModal.style.display="flex";  // Modal anzeigen
                startConfetti();     
                dropItemAfterEliteOrBoss();             // Konfetti starten
            }
        } else if(currentNode.classList.contains("elite")){
            currentNode.eliteCurrentLife--;
            updateEliteBar(currentNode);
            document.getElementById("feedback").innerText="✅ Aufgabe geschafft!";
            if(currentNode.eliteCurrentLife>0){ createEliteTask(currentNode); return;}
            else {
                currentNode.classList.add("completed");
                document.getElementById("eliteBar").style.display="none";
                inLevel=false;
                document.getElementById("taskBox").style.display="none";
                document.getElementById("itemBar").style.display="none";
                (connections[currentNode.id]||[]).forEach(id=>nodes[id].classList.remove("locked"));
                document.getElementById("answer").value="";
    
                 dropItemAfterEliteOrBoss();

            }
        } else {
            currentNode.classList.add("completed");
            inLevel=false;
            document.getElementById("taskBox").style.display="none";
            document.getElementById("itemBar").style.display="none";
            (connections[currentNode.id]||[]).forEach(id=>nodes[id].classList.remove("locked"));
        }
    } else {
        playerLife--; updatePlayerBar();
        document.getElementById("feedback").innerText="❌ Falsch! 1 Leben verloren.";
        if(playerLife<=0){     gameOverModal.style.display = "flex";  // Modal anzeigen
    stopConfetti();  ; resetGame(); return;}
    }
    document.getElementById("answer").value="";
}

/* --- Elite-Knoten zufällig --- */
function assignEliteNodes(){
    const eliteLevels=[2,3];
    eliteLevels.forEach(levelIdx=>{
        const levelNodes = Object.keys(nodes).filter(id=>id.startsWith(`L${levelIdx}_`));
        let selected=[];
        levelNodes.forEach(id=>{ if(Math.random()<0.15) selected.push(id);});
        if(selected.length===0 && levelNodes.length>0) selected.push(levelNodes[Math.floor(Math.random()*levelNodes.length)]);
        selected.forEach(id=>{
            const node = nodes[id];
            node.classList.add("elite");
            node.innerText="👾";
            node.eliteLife=2;
            node.eliteCurrentLife=2;
        });
    });
}

/* --- Map generieren --- */
function generateMap(){
    map.innerHTML=""; nodes={}; connections={};
    const width=map.clientWidth; const heightStep=120;
    const nodeCounts=[1,5,5,5,1]; let previousLevelIds=[];
    for(let y=0;y<nodeCounts.length;y++){
        let count = nodeCounts[y];
        if(y>0 && y<4){ count=Math.max(2,count-(Math.floor(Math.random()*3)+1)); }
        let levelIds=[];
        for(let i=0;i<count;i++){
            const id=`L${y}_${i}`; levelIds.push(id);
            const node = document.createElement("div");
            node.className="node locked"; node.id=id;
            if(y===4){ node.classList.add("boss"); node.innerText="👑"; } else { node.innerText=y===0?1:y; }
            const spacing = width/(count+1);
            const x=spacing*(i+1)-35; const yPos=y*heightStep+30;
            node.style.left=`${x}px`; node.style.top=`${yPos}px`;
            map.appendChild(node); nodes[id]=node;
        }
        if(previousLevelIds.length>0) generateConnectionsSafe(levelIds,previousLevelIds,connections);
        previousLevelIds=levelIds;
    }
    assignEliteNodes();
    Object.values(nodes).forEach(n=>n.classList.add("locked"));
    Object.keys(nodes).filter(id=>id.startsWith("L0")).forEach(id=>nodes[id].classList.remove("locked"));
    drawLines();
    activateNodes();
}

/* --- Start --- */
function applyLevelColors(){
    const colors = levelColors[currentLevel];
    const root = document.documentElement;
    
    // Level-Anzeige aktualisieren
    const levelIcon = currentLevel === "Dorf" ? "🏘️" : "🏙️";
    document.getElementById("levelDisplay").innerText = `${levelIcon} ${currentLevel}`;
    document.getElementById("levelDisplay").style.color = colors.primary;
    
    // Knoten-Farben anpassen (aber completed Nodes nicht überschreiben)
    Object.values(nodes).forEach(node => {
        if(node.classList.contains("completed")) return; // Grüne completed Nodes nicht überschreiben
        if(!node.classList.contains("elite") && !node.classList.contains("boss")){
            node.style.background = colors.node;
            node.style.borderColor = colors.nodeBorder;
        } else if(node.classList.contains("elite")){
            node.style.background = colors.elite;
        }
    });
}

function startGame(){
    // Startscreen ausblenden
    document.getElementById("startScreen").style.display = "none";
    
    // Spielinhalt anzeigen
    document.querySelector(".gameContent").style.display = "block";
    
    // Map generieren und Timer starten
    generateMap();
    applyLevelColors();
    startTimer();
}

function restartGame(){
    // Spielvariablen zurücksetzen
    nodes = {};
    connections = {};
    currentNode = null;
    solution = 0;
    inLevel = false;
    bossLife = 3;
    playerLife = 3;
    
    // UI zurücksetzen
    document.getElementById("taskBox").style.display = "none";
    document.getElementById("bossBar").style.display = "none";
    document.getElementById("eliteBar").style.display = "none";
    document.getElementById("itemBar").style.display = "none";
    document.getElementById("answer").value = "";
    document.getElementById("feedback").innerText = "";
    document.getElementById("itemBar").innerHTML = "";
    
    // Spieler-Leben aktualisieren
    updatePlayerBar();
    
    // Timer zurücksetzen
    stopTimer();
    startTime = null;
    accumulatedTime = 0;
    document.getElementById("timer").innerText = "⏱ 0:00";
    
    // Neue Map generieren und Timer starten
    generateMap();
    applyLevelColors();
    startTimer();
}

// Fortsetzung ohne Timer-Reset (für Levelwechsel Dorf -> Stadt)
function continueToNextLevel(){
    // Spielvariablen zurücksetzen
    nodes = {};
    connections = {};
    currentNode = null;
    solution = 0;
    inLevel = false;
    bossLife = 3;
    playerLife = 3;
    
    // UI zurücksetzen
    document.getElementById("taskBox").style.display = "none";
    document.getElementById("bossBar").style.display = "none";
    document.getElementById("eliteBar").style.display = "none";
    document.getElementById("itemBar").style.display = "none";
    document.getElementById("answer").value = "";
    document.getElementById("feedback").innerText = "";
    document.getElementById("itemBar").innerHTML = "";
    
    // Spieler-Leben aktualisieren
    updatePlayerBar();
    
    // Timer NICHT zurücksetzen - läuft weiter
    
    // Neue Map generieren
    generateMap();
    applyLevelColors();
}

// Enter-Taste im Eingabefeld aktivieren
document.getElementById("answer").addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        checkAnswer();
    }
});



