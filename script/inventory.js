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

    item.onclick = () => {
        if(name === "Heiltrank" && playerLife < playerMaxLife){
            playerLife++;
            updatePlayerBar();
            container.removeChild(item);
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
            } else {
                document.getElementById("feedback").innerText = "⚔️ Kein Gegner aktiv!";
            }
        }
    };
}

function dropItemAfterEliteOrBoss(){
    // 20% Chance für Schwert
    if(Math.random() < 0.2){
        addItemToBar("Schwert", "🗡️", "⚔️+1");
        document.getElementById("feedback").innerText = "🎉 Du hast ein Schwert erhalten!";
    }

    // 100% Heiltrank bei Elite, nur falls Spieler nicht voll Leben hat
    if(playerLife < playerMaxLife){
        giveHealthPotion(); // siehe vorher
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
