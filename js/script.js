let adminMode = false;
const adminBtn = document.getElementById('adminBtn');
const modalBg = document.getElementById('modalBg');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
let currentEditOption = null;
let currentTargetList = null;
let isAddingNew = false;

let prefixData = [
  { id: 1, text: "주문 피해의 0.8%를 에너지 보호막으로 흡수", tag: "prefixA", value: "0.8%", level: "1", type: "생명력" },
  { id: 2, text: "생명력 재생속도 20% 증가", tag: "prefixB", value: "20%", level: "1", type: "특수" }
];

let suffixData = [
  { id: 101, text: "이동 속도 12% 증가", tag: "suffixC", value: "12%", level: "1", type: "마나" },
  { id: 102, text: "명중 시 적 실명", tag: "suffixD", value: "", level: "1", type: "팅크" }
];

let selected = [];

/* 옵션 렌더링 */
function renderOptions(listId, data) {
  const box = document.getElementById(listId);
  box.innerHTML = "";

  data.forEach(opt => {
    const div = document.createElement("div");
    div.className = "option";
    div.dataset.id = opt.id;

    const progress = document.createElement('div');
    progress.className = 'delete-progress';
    div.appendChild(progress);

    const text = document.createElement("span");
    text.textContent = opt.text;
    div.appendChild(text);

    /* 유형 라벨들 */
    const tagBox = document.createElement('div');
    tagBox.className = 'option-tags';

    opt.type.split(',').forEach(typeName => {
      const chip = document.createElement('div');
      chip.className = 'option-tag';

      if (typeName === "생명력") chip.classList.add("tag-life");
      if (typeName === "마나") chip.classList.add("tag-mana");
      if (typeName === "특수") chip.classList.add("tag-special");
      if (typeName === "팅크") chip.classList.add("tag-tincture");

      chip.textContent = typeName;
      tagBox.appendChild(chip);
    });

    /* 수정/삭제 버튼 */
    const btns = document.createElement('div');
    btns.className = 'buttons';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'edit';
    btnEdit.onclick = (e) => { e.stopPropagation(); openModal(opt, listId); };

    const btnDelete = document.createElement('button');
    btnDelete.className = 'delete';

    let deleteTimer = null;
    let deleteHold = 0;
    let holding = false;

    btnDelete.onmousedown = (e) => {
      e.stopPropagation();
      holding = true;
      deleteHold = 0;
      progress.style.width = '0%';

      deleteTimer = setInterval(() => {
        deleteHold += 2.2;
        if (deleteHold >= 100) {
          progress.style.width = '100%';
        } else {
          progress.style.width = deleteHold + '%';
        }
      }, 16);
    };

    btnDelete.onmouseup = () => {
      clearInterval(deleteTimer);
      if (deleteHold >= 100) {
        setTimeout(() => {
          deleteOption(opt, data, listId);
        }, 500);
      }
      holding = false;
      progress.style.width = '0%';
    };

    btnDelete.onmouseleave = () => {
      clearInterval(deleteTimer);
      holding = false;
      progress.style.width = '0%';
    };

    btns.appendChild(btnEdit);
    btns.appendChild(btnDelete);

    div.appendChild(tagBox);
    div.appendChild(btns);

    div.onclick = (e) => {
      if (e.target.closest('button')) return;
      toggleOption(opt);
    };

    enableDrag(div, data, listId);
    box.appendChild(div);
  });

  updateAdminMode();
  addAddButton(box, data, listId);
}

function addAddButton(box, data, listId) {
  if (!adminMode) return;

  const addBtn = document.createElement("div");
  addBtn.className = "add-option";
  addBtn.textContent = "+";

  addBtn.onclick = () => {
    openModal(null, listId);
  };

  box.appendChild(addBtn);
}

/* 선택 */
function toggleOption(opt) {
  if (selected.includes(opt.tag)) selected = selected.filter(v => v !== opt.tag);
  else selected.push(opt.tag);
  updateActiveStates();
  updateResult();
}

function updateActiveStates() {
  document.querySelectorAll('.option').forEach(div => {
    const id = Number(div.dataset.id);
    const opt = [...prefixData, ...suffixData].find(o => o.id === id);
    if (opt && selected.includes(opt.tag)) div.classList.add('active');
    else div.classList.remove('active');
  });
}

function updateResult() {
  document.getElementById('result').value = selected.join(' | ');
}

/* 삭제 */
function deleteOption(opt, data, listId) {
  const idx = data.indexOf(opt);
  if (idx > -1) {
    data.splice(idx, 1);
    renderOptions(listId, data);
    selected = selected.filter(v => v !== opt.tag);
    updateResult();
  }
}

/* 모달 열기 */
function openModal(opt, listId) {
  currentTargetList = listId;
  isAddingNew = (opt === null);
  modalBg.style.display = 'flex';

  document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));

  if (isAddingNew) {
    modalTitle.textContent = "CREATE";
    currentEditOption = null;

    modalName.value = "";
    modalTag.value = "";
    modalValue.value = "";
    modalLevel.value = "";

  } else {
    modalTitle.textContent = "EDIT";
    currentEditOption = opt;

    modalName.value = opt.text;
    modalTag.value = opt.tag;
    modalValue.value = opt.value;
    modalLevel.value = opt.level;

    opt.type.split(',').forEach(t => {
      const btn = document.querySelector(`.type-btn[data-type="${t}"]`);
      if (btn) btn.classList.add("active");
    });
  }
}

/* 모달 닫기 */
modalBg.onclick = (e) => {
  if (e.target === modalBg) modalBg.style.display = 'none';
};

/* 유형 버튼 */
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle('active');
  };
});

/* 저장/추가 */
modalSave.onclick = () => {
  const name = modalName.value;
  const tag = modalTag.value;
  const value = modalValue.value;
  const level = modalLevel.value;

  const types = [...document.querySelectorAll('.type-btn.active')].map(b => b.dataset.type).join(',');

  if (isAddingNew) {
    const newId = Date.now();

    const newObj = {
      id: newId,
      text: name,
      tag: tag,
      value: value,
      level: level,
      type: types
    };

    if (currentTargetList === "prefixList") prefixData.push(newObj);
    else suffixData.push(newObj);

  } else {
    currentEditOption.text = name;
    currentEditOption.tag = tag;
    currentEditOption.value = value;
    currentEditOption.level = level;
    currentEditOption.type = types;
  }

  modalBg.style.display = 'none';
  renderOptions('prefixList', prefixData);
  renderOptions('suffixList', suffixData);
  updateActiveStates();
  updateResult();
};

/* 관리자 모드 */
adminBtn.onclick = () => {
  adminMode = !adminMode;
  adminBtn.classList.toggle('on', adminMode);
  renderOptions('prefixList', prefixData);
  renderOptions('suffixList', suffixData);
};

function updateAdminMode() {
  document.querySelectorAll('.option').forEach(div => {
    const btns = div.querySelector('.buttons');
    if (btns) btns.style.display = adminMode ? 'flex' : 'none';
  });
}

/* 드래그 */
function enableDrag(div, data, listId) {
  let startY = 0;
  let offsetY = 0;
  let dragging = false;
  let originalIndex = 0;

  div.addEventListener("mousedown", e => {
    if (!adminMode) return;
    if (e.target.closest("button")) return;

    dragging = true;
    div.classList.add("dragging");

    startY = e.clientY;
    originalIndex = Array.from(div.parentNode.children).indexOf(div);

    e.preventDefault();
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;

    offsetY = e.clientY - startY;
    div.style.transform = `translateY(${offsetY}px)`;
  });

  window.addEventListener("mouseup", e => {
    if (!dragging) return;
    dragging = false;
    div.classList.remove("dragging");
    div.style.transform = "";

    const siblings = [...div.parentNode.querySelectorAll(".option")];

    let newIndex = originalIndex;

    siblings.forEach((s, i) => {
      if (s === div) return;
      const rect = s.getBoundingClientRect();
      if (e.clientY > rect.top + rect.height / 2) newIndex = i;
    });

    const moved = data.splice(originalIndex, 1)[0];
    data.splice(newIndex, 0, moved);

    renderOptions(listId, data);
  });
}

/* 초기 렌더 */
renderOptions('prefixList', prefixData);
renderOptions('suffixList', suffixData);
