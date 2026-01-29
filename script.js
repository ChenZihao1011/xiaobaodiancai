// 菜谱配置
const menuData = {
    meat: ["红烧肉", "糖醋排骨", "宫保鸡丁", "清蒸鲈鱼", "可乐鸡翅", "土豆烧牛肉", "回锅肉", "蒜香炸鸡", "啤酒鸭", "小炒黄牛肉", "油焖大虾", "粉蒸肉"],
    veggie: ["手撕包菜", "番茄炒蛋", "蒜蓉西兰花", "酸辣土豆丝", "地三鲜", "麻婆豆腐", "蚝油生菜", "干煸四季豆", "清炒时蔬", "虎皮青椒", "凉拌黄瓜", "香菇青菜"],
    staple: ["大米饭", "小米粥", "手工水饺", "炸酱面", "葱油拌面", "馒头", "花卷", "蛋炒饭"]
};

// 获取元素
const datePicker = document.getElementById('date-picker');
const weekdayDisplay = document.getElementById('weekday-display');
const meatSelect = document.getElementById('meat-select');
const veggieSelect = document.getElementById('veggie-select');
const stapleSelect = document.getElementById('staple-select');
const submitBtn = document.getElementById('submit-btn');
const editBtn = document.getElementById('edit-btn');
const orderForm = document.getElementById('order-form');
const resultCard = document.getElementById('result-card');
const resDate = document.getElementById('res-date');
const resMeat = document.getElementById('res-meat');
const resVeggie = document.getElementById('res-veggie');
const resStaple = document.getElementById('res-staple');

// 历史记录与复制相关
const historyBtn = document.getElementById('history-btn');
const historyBtn2 = document.getElementById('history-btn-2');
const historyModal = document.getElementById('history-modal');
const closeHistory = document.getElementById('close-history');
const historyList = document.getElementById('history-list');
const shareBtn = document.getElementById('share-btn'); // 新增

function init() {
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    updateWeekday(today);
    
    populateSelect(meatSelect, menuData.meat);
    populateSelect(veggieSelect, menuData.veggie);
    populateSelect(stapleSelect, menuData.staple);

    checkTodayOrder(today);
}

function populateSelect(el, items) {
    items.forEach(i => {
        let opt = document.createElement('option');
        opt.value = i; opt.textContent = i; el.appendChild(opt);
    });
}

function updateWeekday(dateStr) {
    if(!dateStr) return;
    const d = new Date(dateStr);
    const w = ["周日","周一","周二","周三","周四","周五","周六"];
    weekdayDisplay.textContent = w[d.getDay()];
}

// === 核心数据操作 ===

function getHistory() {
    try {
        const raw = localStorage.getItem('baoMenu_history');
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
}

function saveToHistory(data) {
    let list = getHistory();
    list = list.filter(item => item.date !== data.date);
    list.push(data);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('baoMenu_history', JSON.stringify(list));
}

function renderHistoryList() {
    const list = getHistory();
    historyList.innerHTML = '';
    
    if (list.length === 0) {
        historyList.innerHTML = '<p style="text-align:center;color:#999;margin-top:50px;">暂无记录</p>';
        return;
    }

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info">
                <span class="history-date">${item.date} (${item.weekday})</span>
                <div class="history-detail">🍖 ${item.meat} | 🥬 ${item.veggie} | 🍚 ${item.staple}</div>
            </div>
            <button class="delete-btn" onclick="deleteHistory('${item.date}')">删除</button>
        `;
        historyList.appendChild(div);
    });
}

window.deleteHistory = function(date) {
    if(!confirm("确定要删除 " + date + " 的记录吗？")) return;
    let list = getHistory();
    list = list.filter(i => i.date !== date);
    localStorage.setItem('baoMenu_history', JSON.stringify(list));
    renderHistoryList();
    if(date === datePicker.value) location.reload();
}

function checkTodayOrder(date) {
    const list = getHistory();
    const found = list.find(i => i.date === date);
    if (found) showResult(found);
}

function showResult(data) {
    resDate.textContent = `${data.date} (${data.weekday})`;
    resMeat.textContent = data.meat;
    resVeggie.textContent = data.veggie;
    resStaple.textContent = data.staple;
    orderForm.classList.add('hidden');
    resultCard.classList.remove('hidden');
}

// === 事件监听 ===

// 1. 提交
submitBtn.addEventListener('click', () => {
    const data = {
        date: datePicker.value,
        weekday: weekdayDisplay.textContent,
        meat: meatSelect.value,
        veggie: veggieSelect.value,
        staple: stapleSelect.value
    };
    if(!data.meat || !data.veggie || !data.staple) { alert("菜没选完哦！"); return; }
    saveToHistory(data);
    showResult(data);
});

// 2. 复制功能 (新增)
if(shareBtn) {
    shareBtn.addEventListener('click', () => {
        const text = `🍱 小宝点菜单 🍱\n\n📅 日期：${resDate.textContent}\n🍖 荤菜：${resMeat.textContent}\n🥬 素菜：${resVeggie.textContent}\n🍚 主食：${resStaple.textContent}\n\n👨‍🍳 辛苦大厨啦！`;
        
        navigator.clipboard.writeText(text).then(() => {
            alert("✅ 已复制！\n请去微信粘贴发给我吧~");
        }).catch(err => {
            alert("❌ 复制失败，请手动截图");
        });
    });
}

// 3. 其他按钮
editBtn.addEventListener('click', () => {
    resultCard.classList.add('hidden');
    orderForm.classList.remove('hidden');
    const list = getHistory();
    const found = list.find(i => i.date === datePicker.value);
    if(found) {
        meatSelect.value = found.meat;
        veggieSelect.value = found.veggie;
        stapleSelect.value = found.staple;
    }
});

[historyBtn, historyBtn2].forEach(btn => {
    if(btn) btn.addEventListener('click', () => {
        renderHistoryList();
        historyModal.classList.remove('hidden');
    });
});

closeHistory.addEventListener('click', () => historyModal.classList.add('hidden'));
window.onclick = (e) => { if(e.target == historyModal) historyModal.classList.add('hidden'); }

datePicker.addEventListener('change', (e) => {
    updateWeekday(e.target.value);
    const list = getHistory();
    const found = list.find(i => i.date === e.target.value);
    if(found) showResult(found);
    else {
        resultCard.classList.add('hidden');
        orderForm.classList.remove('hidden');
        meatSelect.value = ""; veggieSelect.value = ""; stapleSelect.value = "";
    }
});

init();