function addItemToBar(name, icon, label){
    const container = document.getElementById("itemBar");
    const item = document.createElement("div");
    item.className = "item";
    item.innerText = icon;

    // Hover-Label unter dem Item
    const hoverLabel = document.createElement("div");
    hoverLabel.className = "hoverLabel";
    hoverLabel.innerText = label; 
    item.appendChild(hoverLabel);

    container.appendChild(item);
    
    // Benachrichtigung anzeigen
    showItemNotification(icon + " " + label + " erhalten!");

    item.onclick = () => {
        if(name === "Heiltrank" && playerLife < playerMaxLife){
            playerLife++;
            updatePlayerBar();
            container.removeChild(item);
            updateItemBarVisibility();
            document.getElementById("feedback").innerText = "💙 Heiltrank benutzt! Leben +1";
        }
        else if(name === "Schwert"){
            if(currentNode && (currentNode.classList.contains("elite") || currentNode.classList.contains("boss"))){
                if(currentNode.classList.contains("elite")){
                    currentNode.eliteCurrentLife--;
                    updateEliteBar(currentNode);
                    document.getElementById("feedback").innerText = "⚔️ Schwert benutzt! Elite verliert 1 Leben";
                    if(currentNode.eliteCurrentLife <= 0){
                        // Elite besiegt
                        currentNode.classList.add("completed");
                        document.getElementById("eliteBar").style.display = "none";
                        inLevel = false;
                        document.getElementById("taskBox").style.display="none";
                        (connections[currentNode.id]||[]).forEach(id => nodes[id].classList.remove("locked"));
                    }
                } else if(currentNode.classList.contains("boss")){
                    bossLife--;
                    updateBossBar();
                    document.getElementById("feedback").innerText = "⚔️ Schwert benutzt! Boss verliert 1 Leben";
                    if(bossLife <= 0){
                        showBossVictoryModal();
                    } else {
                        createBossTask();
                    }
                }
                container.removeChild(item); // Verbrauchtes Item entfernen
                updateItemBarVisibility();
            } else {
                document.getElementById("feedback").innerText = "⚔️ Kein Gegner aktiv!";
            }
        }
        else if(name === "Refresh"){
            if(inLevel && currentNode){
                // Neue Aufgabe generieren
                if(currentNode.classList.contains("boss")){
                    createBossTask();
                } else if(currentNode.classList.contains("elite")){
                    createEliteTask(currentNode);
                } else {
                    createTask(parseInt(currentNode.innerText));
                }
                container.removeChild(item);
                updateItemBarVisibility();
                document.getElementById("feedback").innerText = "🔄 Neue Aufgabe generiert!";
            } else {
                document.getElementById("feedback").innerText = "🔄 Keine aktive Aufgabe!";
            }
        }
    };
}

function giveHealthPotion(){
    addItemToBar("Heiltrank", "💙", "💙 Heiltrank");
}

function updateItemBarVisibility(){
    const container = document.getElementById("itemBar");
    if(container.children.length > 0){
        container.style.display = "flex";
    } else {
        container.style.display = "none";
    }
}

function showItemNotification(message){
    const notification = document.getElementById("itemNotification");
    notification.innerText = message;
    notification.style.display = "block";
    
    // Nach 2 Sekunden ausblenden
    setTimeout(() => {
        notification.style.display = "none";
    }, 2000);
}

function dropItemAfterEliteOrBoss(){
    // 20% Chance für Schwert
    const gotSword = Math.random() < 0.2;
    if(gotSword){
        addItemToBar("Schwert", "🗡️", "⚔️+1");
        document.getElementById("feedback").innerText = "🎉 Du hast ein Schwert erhalten!";
    }

    // 5% Chance für Refresh-Item
    const gotRefresh = Math.random() < 0.05;
    if(gotRefresh){
        addItemToBar("Refresh", "🔄", "🔄 Neue Aufgabe");
    }

    // Heiltrank, falls Spieler nicht voll Leben hat
    if(playerLife < playerMaxLife){
        giveHealthPotion();
    }
    // Falls kein Item gedroppt wurde (kein Schwert und Leben ist voll), garantiere einen Heiltrank
    else if(!gotSword && !gotRefresh){
        giveHealthPotion();
        document.getElementById("feedback").innerText = "🎉 Du hast einen Heiltrank erhalten!";
    }
}



function useHealingPotion(item){
    if(playerLife < playerMaxLife){
        playerLife++;
        updatePlayerBar();
        item.remove(); // Heiltrank verschwindet nach Benutzung
        const msg = document.getElementById("itemMessage");
        msg.innerText = "💙 Heiltrank benutzt! +1 Leben";
        setTimeout(() => msg.innerText = "", 3000);
    } else {
        const msg = document.getElementById("itemMessage");
        msg.innerText = "💙 Dein Leben ist bereits voll!";
        setTimeout(() => msg.innerText = "", 3000);
    }
}
