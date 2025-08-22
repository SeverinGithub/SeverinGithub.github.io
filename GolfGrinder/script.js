document.addEventListener("DOMContentLoaded", () => {
  const picker = document.querySelector(".game-picker");
  const current = document.querySelector(".current-mode");
  const buttons = document.querySelectorAll(".mode-option");

  const modal = document.getElementById("playerModal");
  const modeLabel = modal?.querySelector(".mode-label");
  const form = modal?.querySelector("#playerForm");
  const playersList = modal?.querySelector(".players-list");
  const addBtn = modal?.querySelector(".add-player");
  const cancelBtn = modal?.querySelector(".cancel-modal");
  const roundsSelector = document.getElementById("roundsSelector");
  const roundsInput = document.getElementById("roundsInput");

  const scorecard = document.getElementById("scorecard");
  const scorecardMode = document.querySelector(".scorecard-mode");
  const scorecardTable = document.querySelector(".scorecard-table");

  const footer = document.querySelector(".action-card");

  if (!picker || !current || !buttons.length) return;

  // Ensure holes selector is hidden by default
  if (roundsSelector) {
    roundsSelector.hidden = true;
  }

  function setFooterOffset() {
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const footerHeight = footerRect ? Math.ceil(footerRect.height + 12) : 140;
    const viewportBuffer = Math.ceil(window.innerHeight * 0.09); // 9% of screen height
    const totalOffset = footerHeight + viewportBuffer;
    document.documentElement.style.setProperty("--action-card-offset", `${totalOffset}px`);
  }

  setFooterOffset();
  window.addEventListener("resize", setFooterOffset);
  window.addEventListener("orientationchange", setFooterOffset);
  const details = document.querySelector("details.game-picker");
  details?.addEventListener("toggle", setFooterOffset);

  function openModal(label, mode) {
    if (!modal) return;
    modeLabel && (modeLabel.textContent = label);
    
    // Show/hide holes selector based on mode
    if (roundsSelector) {
      if (mode === "chipping-pro") {
        roundsSelector.hidden = false;
      } else {
        roundsSelector.hidden = true;
      }
    }
    
    modal.hidden = false;

    const firstInput = modal.querySelector(".player-input");
    if (firstInput instanceof HTMLInputElement) {
      setTimeout(() => firstInput.focus(), 0);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
  }

  function createPlayerRow(index) {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <input type="text" inputmode="text" autocomplete="name" placeholder="Player ${index} name" class="player-input" />
      <button type="button" class="remove-player" aria-label="Remove player">×</button>
    `;
    return row;
  }

  function getPlayerNames() {
    return Array.from(modal.querySelectorAll(".player-input"))
      .map((i) => (i instanceof HTMLInputElement ? i.value.trim() : ""))
      .filter((v) => v.length > 0);
  }

  function getChippingHoles() {
    if (roundsInput) {
      return parseInt(roundsInput.value, 10) || 9;
    }
    return 9;
  }

  function holesForMode(mode) {
    switch (mode) {
      case "3-holes": return 3;
      case "6-holes": return 6;
      case "9-holes": return 9;
      case "18-holes": return 18;
      case "chipping-pro": return getChippingHoles(); // Use selected number of holes
      default: return 9;
    }
  }

  function formatModeLabel(mode) {
    const m = {
      "3-holes": "3 Holes",
      "6-holes": "6 Holes",
      "9-holes": "9 Holes",
      "18-holes": "18 Holes",
      "chipping-pro": "Chipping Pro"
    };
    return m[mode] || "Custom";
  }

  function getDefaultPar(mode, holeNumber) {
    // 3 and 6 hole courses are always par 3
    if (mode === "3-holes" || mode === "6-holes") {
      return 3;
    }
    // 9 and 18 hole courses start as par 3 but can be edited
    return 3;
  }

  function calculateChippingPoints(score) {
    if (score === 1) return 1000;
    if (score === 2) return 500;
    if (score === 3) return 250;
    if (score >= 4) return -500; // Penalty for 4+ hits
    return 0;
  }

  function buildScorecard(mode, players) {
    if (!scorecard || !scorecardTable || !scorecardMode) return;

    const numHoles = holesForMode(mode);
    const isChippingPro = mode === "chipping-pro";
    
    if (isChippingPro) {
      scorecardMode.textContent = `${formatModeLabel(mode)} • ${numHoles} holes • ${players.length} player${players.length > 1 ? "s" : ""}`;
    } else {
      scorecardMode.textContent = `${formatModeLabel(mode)} • ${players.length} player${players.length > 1 ? "s" : ""}`;
    }

    const grid = document.createElement("div");
    grid.className = "table-grid";
    grid.style.setProperty("--holes", String(numHoles));

    // First column: Holes header + hole numbers + footer label + points label
    const holeCol = document.createElement("div");
    holeCol.className = "col";
    const holeHeader = document.createElement("div");
    holeHeader.className = "table-cell header";
    holeHeader.textContent = "Hole";
    holeCol.appendChild(holeHeader);
    for (let h = 1; h <= numHoles; h++) {
      const cell = document.createElement("div");
      cell.className = "table-cell";
      cell.textContent = String(h);
      holeCol.appendChild(cell);
    }
    const holeFooter = document.createElement("div");
    holeFooter.className = "table-cell footer";
    holeFooter.textContent = "Total";
    holeCol.appendChild(holeFooter);
    const holePoints = document.createElement("div");
    holePoints.className = "table-cell footer";
    holePoints.textContent = isChippingPro ? "Points" : "Points";
    holeCol.appendChild(holePoints);
    grid.appendChild(holeCol);

    // Second column: Par header + par values + footer label + points calculation (only for non-chipping modes)
    if (!isChippingPro) {
      const parCol = document.createElement("div");
      parCol.className = "col";
      const parHeader = document.createElement("div");
      parHeader.className = "table-cell header";
      parHeader.textContent = "Par";
      parCol.appendChild(parHeader);
      for (let h = 1; h <= numHoles; h++) {
        const cell = document.createElement("div");
        cell.className = "table-cell";
        const defaultPar = getDefaultPar(mode, h);
        if (mode === "3-holes" || mode === "6-holes") {
          // Fixed par 3 for 3/6 hole courses
          cell.textContent = `Par ${defaultPar}`;
        } else {
          // Editable par for 9/18 hole courses
          const parInput = document.createElement("input");
          parInput.className = "par-input";
          parInput.type = "number";
          parInput.inputMode = "numeric";
          parInput.min = "3";
          parInput.max = "6";
          parInput.step = "1";
          parInput.value = defaultPar;
          parInput.dataset.hole = String(h);
          cell.appendChild(parInput);
        }
        parCol.appendChild(cell);
      }
      const parFooter = document.createElement("div");
      parFooter.className = "table-cell footer";
      parFooter.textContent = "Total Par";
      parCol.appendChild(parFooter);
      const parPoints = document.createElement("div");
      parPoints.className = "table-cell footer";
      parPoints.textContent = `(${numHoles} × 8) - Total`;
      parCol.appendChild(parPoints);
      grid.appendChild(parCol);
    }

    // Player columns
    players.forEach((name, playerIdx) => {
      const col = document.createElement("div");
      col.className = "col";
      const header = document.createElement("div");
      header.className = "table-cell header";
      header.textContent = name || `Player ${playerIdx + 1}`;
      col.appendChild(header);

      for (let h = 1; h <= numHoles; h++) {
        const cell = document.createElement("div");
        cell.className = "table-cell";
        const input = document.createElement("input");
        input.className = "score-input";
        input.type = "number";
        input.inputMode = "numeric";
        input.min = "0";
        input.step = "1";
        input.placeholder = "-";
        input.dataset.player = String(playerIdx);
        input.dataset.hole = String(h);
        cell.appendChild(input);
        col.appendChild(cell);
      }

      const footer = document.createElement("div");
      footer.className = "table-cell footer score-sum";
      footer.dataset.playerSum = String(playerIdx);
      footer.textContent = "0";
      col.appendChild(footer);
      
      const points = document.createElement("div");
      points.className = "table-cell footer score-points";
      points.dataset.playerPoints = String(playerIdx);
      if (isChippingPro) {
        points.textContent = "0";
      } else {
        points.textContent = String(numHoles * 8);
      }
      col.appendChild(points);
      
      grid.appendChild(col);
    });

    scorecardTable.innerHTML = "";
    scorecardTable.appendChild(grid);
    scorecard.hidden = false;

    if (!isChippingPro) {
      bindParInputs();
    }
    bindScoring();
    setFooterOffset();
  }

  function bindParInputs() {
    if (!scorecardTable) return;
    const parInputs = scorecardTable.querySelectorAll(".par-input");
    
    function updateTotalPar() {
      let totalPar = 0;
      parInputs.forEach((inp) => {
        const val = inp instanceof HTMLInputElement ? parseInt(inp.value, 10) : NaN;
        if (!Number.isNaN(val)) totalPar += val;
      });
      const totalParCell = scorecardTable.querySelector(".table-cell.footer:nth-child(2)");
      if (totalParCell) totalParCell.textContent = `Total Par ${totalPar}`;
    }

    parInputs.forEach((inp) => {
      inp.addEventListener("input", updateTotalPar);
    });
    
    // Set initial total par
    updateTotalPar();
  }

  function bindScoring() {
    if (!scorecardTable) return;
    const inputs = scorecardTable.querySelectorAll(".score-input");
    const isChippingPro = document.body.dataset.gameMode === "chipping-pro";

    function computeSum(playerIdx) {
      let sum = 0;
      let totalPoints = 0;
      const playerInputs = scorecardTable.querySelectorAll(`.score-input[data-player="${playerIdx}"]`);
      
      playerInputs.forEach((inp) => {
        const val = inp instanceof HTMLInputElement ? parseInt(inp.value, 10) : NaN;
        if (!Number.isNaN(val)) {
          sum += val;
          if (isChippingPro) {
            totalPoints += calculateChippingPoints(val);
          }
        }
      });
      
      const sumCell = scorecardTable.querySelector(`.score-sum[data-player-sum="${playerIdx}"]`);
      if (sumCell) sumCell.textContent = String(sum);
      
      // Calculate and update points
      const pointsCell = scorecardTable.querySelector(`.score-points[data-player-points="${playerIdx}"]`);
      if (pointsCell) {
        if (isChippingPro) {
          pointsCell.textContent = String(totalPoints);
        } else {
          const numHoles = playerInputs.length;
          const points = (numHoles * 8) - sum;
          pointsCell.textContent = String(points);
        }
      }
    }

    inputs.forEach((inp) => {
      inp.addEventListener("input", () => {
        const playerIdx = inp.getAttribute("data-player");
        if (playerIdx != null) computeSum(playerIdx);
      });
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.textContent?.trim() || "Choose mode";
      const mode = btn.getAttribute("data-mode") || "";

      current.textContent = label;
      document.body.dataset.gameMode = mode;
      picker.open = false;

      openModal(label, mode);

      const evt = new CustomEvent("game-mode-selected", { detail: { mode, label } });
      window.dispatchEvent(evt);
    });
  });

  addBtn?.addEventListener("click", () => {
    if (!playersList) return;
    const count = playersList.querySelectorAll(".player-row").length;
    if (count >= 4) return;
    const row = createPlayerRow(count + 1);
    playersList.appendChild(row);
    const input = row.querySelector(".player-input");
    if (input instanceof HTMLInputElement) input.focus();
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  cancelBtn?.addEventListener("click", () => closeModal());

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const names = getPlayerNames();
    if (names.length === 0) {
      const input = modal.querySelector(".player-input");
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }
    const data = { mode: document.body.dataset.gameMode || "", players: names };
    const evt = new CustomEvent("players-confirmed", { detail: data });
    window.dispatchEvent(evt);
    closeModal();

    buildScorecard(data.mode, data.players);
  });

  // Delegate remove-player on list
  playersList?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("remove-player")) return;
    const row = target.closest(".player-row");
    if (!row || !playersList) return;

    // Ensure at least one row remains
    if (playersList.querySelectorAll(".player-row").length <= 1) return;
    row.remove();

    // Re-number placeholders
    Array.from(playersList.querySelectorAll(".player-input")).forEach((input, idx) => {
      if (input instanceof HTMLInputElement) input.placeholder = `Player ${idx + 1} name`;
    });
  });

  // ESC closes modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });
}); 