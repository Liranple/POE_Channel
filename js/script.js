let adminMode = false;
const adminBtn = document.getElementById("adminBtn");
const modalBg = document.getElementById("modalBg");
const modalSave = document.getElementById("modalSave");

let modalMode = "edit"; // 'edit' or 'add'
let modalListId = null;
let currentEditOption = null;

/* ------------------ 데이터 ------------------ */
const prefixData = [
  {
    id: 1,
    text: "주문 피해의 0.8%를 에너지 보호막으로 흡수",
    tag: "속도.14",
    value: "0.8%",
    level: "1",
    type: "생명력",
  },
  {
    id: 2,
    text: "생명력 재생속도 20% 증가",
    tag: "어도.60",
    value: "20%",
    level: "1",
    type: "마나",
  },
];

const suffixData = [
  {
    id: 101,
    text: "이동 속도 12% 증가",
    tag: "간.40%",
    value: "12%",
    level: "1",
    type: "특수",
  },
  {
    id: 102,
    text: "명중 시 적 실명",
    tag: "회피.60",
    value: "",
    level: "1",
    type: "팅크",
  },
];

let selected = [];

/* ------------------ 타입 버튼(생명/마나/특수/팅크) 클릭 이벤트: 전역 1회만 바인딩 ------------------ */
const typeButtons = document.querySelectorAll(".type-btn");
typeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
  });
});

/* ------------------ 선택 토글 / 결과 업데이트 ------------------ */
function toggleOption(opt) {
  if (selected.includes(opt.tag))
    selected = selected.filter((t) => t !== opt.tag);
  else selected.push(opt.tag);

  updateActiveStates();
  updateResult();
}

function updateActiveStates() {
  document.querySelectorAll(".option").forEach((div) => {
    const id = parseInt(div.dataset.id, 10);
    const opt = [...prefixData, ...suffixData].find((o) => o.id === id);

    if (opt && selected.includes(opt.tag)) div.classList.add("active");
    else div.classList.remove("active");
  });
}

function updateResult() {
  const tags = [];
  selected.forEach((tag) => {
    const opt = [...prefixData, ...suffixData].find((o) => o.tag === tag);
    if (opt) tags.push(opt.tag);
  });
  document.getElementById("result").value = tags.join(" | ");
}

/* ------------------ 삭제 처리 ------------------ */
function deleteOption(opt, data, listId) {
  const idx = data.indexOf(opt);
  if (idx > -1) {
    data.splice(idx, 1);
    selected = selected.filter((t) => t !== opt.tag);
    renderOptions("prefixList", prefixData);
    renderOptions("suffixList", suffixData);
    updateResult();
  }
}

/* ------------------ 모달 열기 ------------------ */
function openModal(opt, mode, listId) {
  modalMode = mode;
  modalListId = listId;
  currentEditOption = opt;

  const name = document.getElementById("modalName");
  const tag = document.getElementById("modalTag");
  const val = document.getElementById("modalValue");
  const lvl = document.getElementById("modalLevel");

  /* 타입 버튼 초기화 */
  document
    .querySelectorAll(".type-btn")
    .forEach((b) => b.classList.remove("active"));

  if (mode === "edit" && opt) {
    document.getElementById("modalTitle").textContent = "EDIT";
    modalSave.textContent = "저장";

    name.value = opt.text;
    tag.value = opt.tag;
    val.value = opt.value;
    lvl.value = opt.level;

    const savedTypes = opt.type.split(",");
    document.querySelectorAll(".type-btn").forEach((b) => {
      if (savedTypes.includes(b.dataset.type)) b.classList.add("active");
    });
  } else {
    document.getElementById("modalTitle").textContent = "CREATE";
    modalSave.textContent = "추가";

    name.value = "";
    tag.value = "";
    val.value = "";
    lvl.value = "";
  }

  modalBg.style.display = "flex";
  // ⬆ 타입 버튼 클릭 핸들러는 이미 전역에서 1회만 바인딩되어 있으므로
  // 여기서 다시 onclick을 설정할 필요 없음 (중복 토글 버그 방지)
}

/* ------------------ 모달 저장/추가 ------------------ */
modalSave.onclick = () => {
  const name = document.getElementById("modalName").value;
  const tag = document.getElementById("modalTag").value;
  const val = document.getElementById("modalValue").value;
  const lvl = document.getElementById("modalLevel").value;

  const selectedTypes = [...document.querySelectorAll(".type-btn.active")].map(
    (b) => b.dataset.type
  );
  const type = selectedTypes.join(",");

  if (modalMode === "edit" && currentEditOption) {
    currentEditOption.text = name;
    currentEditOption.tag = tag;
    currentEditOption.value = val;
    currentEditOption.level = lvl;
    currentEditOption.type = type;
  } else if (modalMode === "add") {
    const arr = modalListId === "prefixList" ? prefixData : suffixData;
    const base = modalListId === "prefixList" ? 0 : 100;
    const maxId = arr.reduce((m, o) => Math.max(m, o.id), base);

    arr.push({
      id: maxId + 1,
      text: name || "새 옵션",
      tag: tag || "tag" + (maxId + 1),
      value: val,
      level: lvl,
      type: type,
    });
  }

  modalBg.style.display = "none";
  renderOptions("prefixList", prefixData);
  renderOptions("suffixList", suffixData);
  updateActiveStates();
  updateResult();
};

/* ------------------ 모달 닫기 ------------------ */
let modalDown = false;
document
  .querySelector(".modal")
  .addEventListener("mousedown", () => (modalDown = true));
document.addEventListener("mouseup", () => (modalDown = false));

modalBg.addEventListener("mouseup", (e) => {
  if (!modalDown && e.target === modalBg) modalBg.style.display = "none";
});

/* ------------------ 관리자 모드 ------------------ */
adminBtn.onclick = () => {
  adminMode = !adminMode;
  adminBtn.classList.toggle("on", adminMode);
  renderOptions("prefixList", prefixData);
  renderOptions("suffixList", suffixData);
};

function updateAdminMode() {
  document.querySelectorAll(".option").forEach((div) => {
    div.querySelectorAll("button").forEach((btn) => {
      btn.style.display = adminMode ? "inline-block" : "none";
    });
  });
}

/* ------------------ 드래그 정렬 ------------------ */
function attachDrag(div, listId) {
  if (!adminMode) return;
  const listEl = document.getElementById(listId);
  let dragging = false;
  let placeholder = null;
  let offsetX = 0,
    offsetY = 0;

  div.addEventListener("mousedown", (e) => {
    if (!adminMode) return;
    if (e.button !== 0) return;
    if (e.target.closest("button")) return;

    dragging = true;
    const rect = div.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    placeholder = document.createElement("div");
    placeholder.className = "option";
    placeholder.style.visibility = "hidden";
    placeholder.style.height = rect.height + "px";

    listEl.insertBefore(placeholder, div.nextSibling);

    div.classList.add("dragging");
    div.style.position = "fixed";
    div.style.width = rect.width + "px";
    div.style.left = rect.left + "px";
    div.style.top = rect.top + "px";
    div.style.zIndex = 9999;
    div.style.pointerEvents = "none";
    document.body.appendChild(div);

    const move = (ev) => {
      if (!dragging) return;
      div.style.left = ev.clientX - offsetX + "px";
      div.style.top = ev.clientY - offsetY + "px";

      const items = [...listEl.children].filter(
        (el) =>
          el.classList.contains("option") && el !== placeholder && el !== div
      );

      for (const item of items) {
        const r = item.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        if (ev.clientY < mid) {
          listEl.insertBefore(placeholder, item);
          return;
        }
      }

      const addBtn = listEl.querySelector(".add-option");
      if (addBtn) listEl.insertBefore(placeholder, addBtn);
      else listEl.appendChild(placeholder);
    };

    const up = () => {
      if (!dragging) return;
      dragging = false;

      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      div.classList.remove("dragging");
      div.style.position = "";
      div.style.left = "";
      div.style.top = "";
      div.style.width = "";
      div.style.zIndex = "";
      div.style.pointerEvents = "";

      listEl.insertBefore(div, placeholder);
      placeholder.remove();

      const arr = listId === "prefixList" ? prefixData : suffixData;
      const newOrder = [];

      listEl.querySelectorAll(".option").forEach((el) => {
        const id = parseInt(el.dataset.id, 10);
        const opt = arr.find((o) => o.id === id);
        if (opt) newOrder.push(opt);
      });

      // 🔧 버그 수정: 배열 안에 배열이 들어가는 것 방지
      // 기존: arr.splice(0, arr.length, newOrder);
      // 수정: 아래처럼 스프레드로 펼쳐서 넣어야 함
      arr.splice(0, arr.length, ...newOrder);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
}

/* ------------------ 옵션 리스트 렌더링 ------------------ */
function renderOptions(listId, data) {
  const box = document.getElementById(listId);
  box.innerHTML = "";

  data.forEach((opt) => {
    const div = document.createElement("div");
    div.className = "option";
    div.dataset.id = opt.id;

    const progress = document.createElement("div");
    progress.className = "delete-progress";
    div.appendChild(progress);

    const text = document.createElement("span");
    text.textContent = opt.text;
    text.style.position = "relative";
    text.style.zIndex = 2;
    div.appendChild(text);

    const tagBox = document.createElement("div");
    tagBox.className = "option-tags";

    opt.type.split(",").forEach((t) => {
      const type = t.trim();
      if (type !== "") {
        const chip = document.createElement("div");
        chip.className = "option-tag";

        if (type === "생명력") chip.classList.add("tag-life");
        if (type === "마나") chip.classList.add("tag-mana");
        if (type === "특수") chip.classList.add("tag-special");
        if (type === "팅크") chip.classList.add("tag-tincture");

        chip.textContent = type;
        tagBox.appendChild(chip);
      }
    });

    const btns = document.createElement("div");
    btns.className = "buttons";

    const btnEdit = document.createElement("button");
    btnEdit.className = "edit";
    btnEdit.onclick = (e) => {
      e.stopPropagation();
      openModal(opt, "edit", listId);
    };

    const btnDelete = document.createElement("button");
    btnDelete.className = "delete";

    let deleteTimer = null;
    let holdTimer = null;
    let progressVal = 0;
    let filled = false;
    let holding = false;

    btnDelete.onmousedown = (e) => {
      e.stopPropagation();
      progressVal = 0;
      filled = false;
      holding = true;

      deleteTimer = setInterval(() => {
        if (!holding) return;
        progressVal += 2;
        if (progressVal > 100) progressVal = 100;
        progress.style.width = progressVal + "%";

        if (progressVal >= 100 && !filled) {
          filled = true;
          holdTimer = setTimeout(() => {
            if (holding) deleteOption(opt, data, listId);
          }, 300);
        }
      }, 20);
    };

    const cancel = () => {
      holding = false;
      clearInterval(deleteTimer);
      clearTimeout(holdTimer);
      progress.style.width = "0%";
      filled = false;
    };

    btnDelete.onmouseup = cancel;
    btnDelete.onmouseleave = cancel;

    btns.appendChild(btnEdit);
    btns.appendChild(btnDelete);

    const rightBox = document.createElement("div");
    rightBox.className = "right-box";

    rightBox.appendChild(tagBox);
    rightBox.appendChild(btns);

    div.appendChild(rightBox);

    div.onclick = (e) => {
      if (e.target.closest("button")) return;
      toggleOption(opt);
    };

    box.appendChild(div);
    updateAdminMode();
    attachDrag(div, listId);
  });
  // ▼▼▼ 여기 추가 버튼 넣기 ▼▼▼
  if (adminMode) {
    const addBtn = document.createElement("div");
    addBtn.className = "add-option";
    addBtn.textContent = "+";
    addBtn.onclick = () => openModal(null, "add", listId);
    box.appendChild(addBtn);
  }
}

/* ------------------ 초기 렌더링 ------------------ */
renderOptions("prefixList", prefixData);
renderOptions("suffixList", suffixData);
