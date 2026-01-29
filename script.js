// ====== 1. 这里是菜谱数据库，你可以随意增加 ======
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

// ====== 2. 获取页面元素 ======
const datePicker = document.getElementById('date-picker');
const weekdayDisplay = document.getElementById('weekday-display');
const meatSelect = document.getElementById('meat-select');
const veggieSelect = document.getElementById('veggie-select');
const stapleSelect = document.getElementById('staple-select');
const submitBtn = document.getElementById('submit-btn');
const editBtn = document.getElementById('edit-btn');

const orderForm = document.getElementById('order-form');
const resultCard = document.getElementById('result-card');

// 结果展示元素
const resDate = document.getElementById('res-date');
const resMeat = document.getElementById('res-meat');
const resVeggie = document.getElementById('res-veggie');
const resStaple = document.getElementById('res-staple');

// ====== 3. 初始化页面 ======
function init() {
    // 1. 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    updateWeekday(today);

    // 2. 填充下拉菜单选项
    populateSelect(meatSelect, menuData.meat);
    populateSelect(veggieSelect, menuData.veggie);
    populateSelect(stapleSelect, menuData.staple);

    // 3. 检查是否有历史记录（如果有，直接显示上次点的）
    loadSavedMenu();
}

// 辅助函数：填充下拉框
function populateSelect(selectElement, items) {
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
}

// 辅助函数：更新星期几
function updateWeekday(dateString) {
    if (!dateString) return;
    const date = new Date(dateString);
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    weekdayDisplay.textContent = weekdays[date.getDay()];
}

// ====== 4. 事件监听 ======

// 当日期改变时，更新星期几
datePicker.addEventListener('change', (e) => {
    updateWeekday(e.target.value);
});

// 点击提交按钮
submitBtn.addEventListener('click', () => {
    // 获取用户选择
    const choice = {
        date: datePicker.value,
        weekday: weekdayDisplay.textContent,
        meat: meatSelect.value,
        veggie: veggieSelect.value,
        staple: stapleSelect.value
    };

    // 简单验证：必须选完
    if (!choice.meat || !choice.veggie || !choice.staple) {
        alert("小宝，菜还没点完呢！(｡•ˇ‸ˇ•｡)");
        return;
    }

    // 保存到本地存储
    localStorage.setItem('baoMenu_record', JSON.stringify(choice));

    // 展示结果
    showResult(choice);
});

// 点击修改按钮
editBtn.addEventListener('click', () => {
    // 隐藏结果，显示表单
    resultCard.classList.add('hidden');
    orderForm.classList.remove('hidden');
});

// ====== 5. 核心逻辑函数 ======

function showResult(data) {
    // 填入数据
    resDate.textContent = `${data.date} (${data.weekday})`;
    resMeat.textContent = data.meat;
    resVeggie.textContent = data.veggie;
    resStaple.textContent = data.staple;

    // 切换视图
    orderForm.classList.add('hidden');
    resultCard.classList.remove('hidden');
}

function loadSavedMenu() {
    const saved = localStorage.getItem('baoMenu_record');
    if (saved) {
        const data = JSON.parse(saved);
        
        // 自动回填表单（方便修改）
        datePicker.value = data.date;
        updateWeekday(data.date);
        meatSelect.value = data.meat;
        veggieSelect.value = data.veggie;
        stapleSelect.value = data.staple;

        // 直接显示结果卡片
        showResult(data);
    }
}

// 启动程序
init();