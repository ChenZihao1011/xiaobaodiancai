// ====== 1. 菜谱数据库 ======
const menuData = {
    meat: [
        "红烧肉", "糖醋排骨", "宫保鸡丁", "清蒸鲈鱼", 
        "可乐鸡翅", "土豆烧牛肉", "回锅肉", "蒜香炸鸡", 
        "啤酒鸭", "小炒黄牛肉", "油焖大虾", "粉蒸肉"
    ],
    veggie: [
        "手撕包菜", "番茄炒蛋", "蒜蓉西兰花", "酸辣土豆丝", 
        "地三鲜", "麻婆豆腐", "蚝油生菜", "干煸四季豆", 
        "清炒时蔬", "虎皮青椒", "凉拌黄瓜", "香菇青菜"
    ],
    staple: [
        "大米饭", "小米粥", "手工水饺", "炸酱面", 
        "葱油拌面", "馒头", "花卷", "蛋炒饭"
    ]
};

// ====== 2. 获取元素 ======
const datePicker = document.getElementById('date-picker');
const weekdayDisplay = document.getElementById('weekday-display');
const meatSelect = document.getElementById('meat-select');
const veggieSelect = document.getElementById('veggie-select');
const stapleSelect = document.getElementById('staple-select');
const submitBtn = document.getElementById('submit-btn');
const editBtn = document.getElementById('edit-btn');
const orderForm = document.getElementById('order-form');
const resultCard = document.getElementById('result-card');

// 结果页元素
const resDate = document.getElementById('res-date');
const resMeat = document.getElementById('res-meat');
const resVeggie = document.getElementById('res-veggie');
const resStaple = document.getElementById('res-staple');

// 历史记录相关元素
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const closeHistory = document.getElementById('close-history');
const historyList = document.getElementById('history-list');

// ====== 3. 初始化 ======
function init() {
    // 默认今天
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    updateWeekday(today);

    // 填充下拉框
    populateSelect(meatSelect, menuData.meat);
    populateSelect(veggieSelect, menuData.veggie);
    populateSelect(stapleSelect, menuData.staple);

    // 检查今天是否已经点过（为了方便显示）
    checkTodayOrder(today);
}

function populateSelect(selectElement, items) {
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

function updateWeekday(dateString) {
    if (!dateString) return;
    const date = new Date(dateString);
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    weekdayDisplay.textContent = weekdays[date.getDay()];
    return weekdays[date.getDay()];
}

// ====== 4. 核心逻辑：保存与读取 ======

// 保存/更新记录到历史列表
function saveToHistory(data) {
    // 1. 获取现有历史记录（如果没有就是空数组）
    let history = JSON.parse(localStorage.getItem('baoMenu_history') || '[]');
    
    // 2. 检查该日期是否已存在
    const existingIndex = history.findIndex(item => item.date === data.date);
    
    if (existingIndex > -1) {
        // 如果存在，更新它
        history[existingIndex] = data;
    } else {
        // 如果不存在，添加新的
        history.push(data);
    }

    // 3. 按日期倒序排序（新的在前面）
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. 存回本地
    localStorage.setItem('baoMenu_history', JSON.stringify(history));
}

// 渲染历史记录列表
function renderHistoryList() {
    const history = JSON.parse(localStorage.getItem('baoMenu_history') || '[]');
    historyList.innerHTML = ''; // 清空当前列表

    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align:center;color:#999;margin-top:50px;">暂无记录，快去点菜吧~</p>';
        return;
    }

    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span class="history-date">${item.date} (${item.weekday})</span>
            <div class="history-detail">
                🍖 ${item.meat} <br>
                🥬 ${item.veggie} <br>
                🍚 ${item.staple}
            </div>
            <button class="delete-btn" onclick="deleteHistory('${item.date}')">🗑️</button>
        `;
        historyList.appendChild(div);
    });
}

// 删除某条记录 (挂载到window以便HTML调用)
window.deleteHistory = function(dateToDelete) {
    if(!confirm('确定要删除这条记录吗？')) return;

    let history = JSON.parse(localStorage.getItem('baoMenu_history') || '[]');
    // 过滤掉要删的那条
    history = history.filter(item => item.date !== dateToDelete);
    localStorage.setItem('baoMenu_history', JSON.stringify(history));
    
    // 重新渲染列表
    renderHistoryList();
    
    // 如果删的是今天的，刷新一下页面重置状态
    if(dateToDelete === datePicker.value) {
        location.reload();
    }
}

// 检查今天是否有记录，如果有，直接显示结果页
function checkTodayOrder(date) {
    const history = JSON.parse(localStorage.getItem('baoMenu_history') || '[]');
    const todayRecord = history.find(item => item.date === date);
    
    if (todayRecord) {
        showResult(todayRecord);
    }
}

// ====== 5. 事件监听 ======

datePicker.addEventListener('change', (e) => {
    updateWeekday(e.target.value);
    // 切换日期时，重置表单为该日期的记录（如果有），没有则清空
    const history = JSON.parse(localStorage.getItem('baoMenu_history') || '[]');
    const record = history.find(item => item.date === e.target.value);
    if(record) {
        showResult(record);
    } else {
        // 重置为表单模式
        resultCard.classList.add('hidden');
        orderForm.classList.remove('hidden');
        meatSelect.value = "";
        veggieSelect.value = "";
        stapleSelect.value = "";
    }
});

submitBtn.addEventListener('click', () => {
    const choice = {
        date: datePicker.value,
        weekday: weekdayDisplay.textContent,
        meat: meatSelect.value,
        veggie: veggieSelect.value,
        staple: stapleSelect.value
    };

    if (!choice.meat || !choice.veggie || !choice.staple) {
        alert("小宝，菜还没点完呢！(｡•ˇ‸ˇ•｡)");
        return;
    }

    // 保存到历史记录
    saveToHistory(choice);
    // 展示结果
    showResult(choice);
});

editBtn.addEventListener('click', () => {
    resultCard.classList.add('hidden');
    orderForm.classList.remove('hidden');
    
    // 回填数据，方便修改
    const history = JSON.parse(localStorage.getItem('baoMenu_history') || '[]');
    const record = history.find(item => item.date === datePicker.value);
    if(record){
        meatSelect.value = record.meat;
        veggieSelect.value = record.veggie;
        stapleSelect.value = record.staple;
    }
});

function showResult(data) {
    resDate.textContent = `${data.date} (${data.weekday})`;
    resMeat.textContent = data.meat;
    resVeggie.textContent = data.veggie;
    resStaple.textContent = data.staple;
    orderForm.classList.add('hidden');
    resultCard.classList.remove('hidden');
}

// === 历史记录弹窗控制 ===
historyBtn.addEventListener('click', () => {
    renderHistoryList(); // 打开前重新获取数据
    historyModal.classList.remove('hidden');
});

closeHistory.addEventListener('click', () => {
    historyModal.classList.add('hidden');
});

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target == historyModal) {
        historyModal.classList.add('hidden');
    }
}

// 启动
init();