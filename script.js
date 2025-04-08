// JavaScript 代码与上一版本相同，保持不变
document.addEventListener('DOMContentLoaded', () => {
    fetchAlphaCounts();
    setupInteractions();
    const connectionManager = new ConnectionManager();
});

/**
 * 获取Alpha状态数据
 */
async function fetchAlphaCounts() {
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const flowchartContainer = document.getElementById('flowchart-container');

    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    flowchartContainer.style.display = 'none';

    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟从API获取数据
        // 实际项目中，这里应该替换为真实的API请求
        // 例如: const response = await fetch('/api/alpha-status');
        //       const data = await response.json();
        const mockData = {
            success: true,
            data: {
                common: 15,
                to_check: 8,
                check_failed: 3,
                to_submit: 5,
                submit_failed: 1,
                submitted: 22
            }
        };

        if (mockData.success) {
            updateUI(mockData.data);
            flowchartContainer.style.display = 'block';

            // 添加简单的动画效果
            animateCounters();

            // 在数据加载完成后调用绘制函数
            showFlowchart();
        } else {
            throw new Error(mockData.message || '获取Alpha状态数据失败');
        }

    } catch (error) {
        console.error("获取Alpha状态数据时出错:", error);
        errorMessage.textContent = `加载数据失败：${error.message}`;
        errorMessage.style.display = 'block';
    } finally {
        loadingMessage.style.display = 'none';
    }
}

/**
 * 更新UI显示数据
 */
function updateUI(counts) {
    const stateIds = [
        'common', 'to_check', 'check_failed',
        'to_submit', 'submit_failed', 'submitted'
    ];

    stateIds.forEach(stateId => {
        const element = document.getElementById(`count-${stateId}`);
        if (element) {
            // 将数据保存为自定义属性，用于动画
            element.setAttribute('data-target', counts[stateId] || 0);
            element.textContent = '0'; // 先设为0，然后动画到目标值
        } else {
            console.warn(`找不到ID为count-${stateId}的元素`);
        }
    });
}

/**
 * 数字计数动画效果
 */
function animateCounters() {
    const duration = 1500; // 动画持续时间（毫秒）
    const counters = document.querySelectorAll('.node-count');
    const frameRate = 30; // 每秒帧数
    const frames = duration / (1000 / frameRate);

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const increment = target / frames;
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
}

/**
 * 设置交互效果
 */
function setupInteractions() {
    setupNodeHoverEffects();
    setupArrowHoverEffects();
}

/**
 * 设置节点悬停效果
 */
function setupNodeHoverEffects() {
    const nodes = document.querySelectorAll('.node');
    const nodeArrowMap = {
        'node-initial': [
            { arrow: '.arrow-down-left', label: '.label-down-left' },
            { arrow: '.arrow-down-right', label: '.label-down-right' }
        ],
        'node-common': [
            { arrow: '.arrow-down-left', label: '.label-down-left' }
        ],
        'node-to_check': [
            { arrow: '.arrow-down-right', label: '.label-down-right' },
            { arrow: '.arrow-to-failed', label: '.label-to-failed' },
            { arrow: '.arrow-to-submit', label: '.label-to-submit' }
        ],
        'node-check_failed': [
            { arrow: '.arrow-to-failed', label: '.label-to-failed' }
        ],
        'node-to_submit': [
            { arrow: '.arrow-to-submit', label: '.label-to-submit' },
            { arrow: '.arrow-to-submit-failed', label: '.label-to-submit-failed' },
            { arrow: '.arrow-to-submitted', label: '.label-to-submitted' }
        ],
        'node-submit_failed': [
            { arrow: '.arrow-to-submit-failed', label: '.label-to-submit-failed' }
        ],
        'node-submitted': [
            { arrow: '.arrow-to-submitted', label: '.label-to-submitted' }
        ]
    };

    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const nodeId = node.id;
            const relatedArrows = nodeArrowMap[nodeId] || [];

            relatedArrows.forEach(({ arrow, label }) => {
                document.querySelector(arrow)?.classList.add('active');
                document.querySelector(label)?.classList.add('active');
            });
        });

        node.addEventListener('mouseleave', () => {
            document.querySelectorAll('.flow-arrow.active').forEach(el => {
                el.classList.remove('active');
            });
            document.querySelectorAll('.arrow-label.active').forEach(el => {
                el.classList.remove('active');
            });
        });
    });
}

/**
 * 设置箭头悬停效果
 */
function setupArrowHoverEffects() {
    const arrows = document.querySelectorAll('.flow-arrow');
    const labels = document.querySelectorAll('.arrow-label');

    // 将箭头和标签关联起来
    arrows.forEach((arrow, index) => {
        if (labels[index]) {
            // 箭头悬停时高亮标签
            arrow.addEventListener('mouseenter', () => {
                labels[index].classList.add('active');
            });
            arrow.addEventListener('mouseleave', () => {
                labels[index].classList.remove('active');
            });

            // 标签悬停时高亮箭头
            labels[index].addEventListener('mouseenter', () => {
                arrow.classList.add('active');
            });
            labels[index].addEventListener('mouseleave', () => {
                arrow.classList.remove('active');
            });
        }
    });
}

// 实际项目中可以添加定时刷新
// const REFRESH_INTERVAL_MS = 60000; // 1分钟刷新一次
// setInterval(fetchAlphaCounts, REFRESH_INTERVAL_MS);

// 添加调整连接线位置的函数，以适应不同屏幕尺寸
window.addEventListener('resize', () => {
    // 如果需要，可以在这里添加调整连接线位置的逻辑
});

class ConnectionManager {
    constructor() {
        this.svg = document.querySelector('.connections-layer');
        this.connections = [];
        this.init();
    }

    init() {
        // 监听窗口大小变化，重新计算连接
        window.addEventListener('resize', () => this.updateAllConnections());
        // 初始化连接
        this.setupConnections();
    }

    setupConnections() {
        const connections = [
            {
                from: document.querySelector('#node1'),
                to: document.querySelector('#node2'),
                label: '数据流向'
            },
            // 添加更多连接配置...
        ];

        connections.forEach(conn => {
            this.createConnection(conn.from, conn.to, conn.label);
        });
    }

    createConnection(fromElement, toElement, label) {
        const connection = {
            from: fromElement,
            to: toElement,
            path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
            label: this.createLabel(label)
        };

        this.svg.appendChild(connection.path);
        this.svg.appendChild(connection.label);
        this.connections.push(connection);
        this.updateConnection(connection);
    }

    createLabel(text) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        textElement.textContent = text;
        textElement.setAttribute('class', 'connection-label');
        background.setAttribute('class', 'connection-label-bg');

        g.appendChild(background);
        g.appendChild(textElement);

        return g;
    }

    updateConnection(connection) {
        const fromRect = connection.from.getBoundingClientRect();
        const toRect = connection.to.getBoundingClientRect();

        // 计算连接线的起点和终点
        const start = {
            x: fromRect.left + fromRect.width / 2,
            y: fromRect.top + fromRect.height / 2
        };

        const end = {
            x: toRect.left + toRect.width / 2,
            y: toRect.top + toRect.height / 2
        };

        // 创建贝塞尔曲线路径
        const path = this.createPath(start, end);
        connection.path.setAttribute('d', path);
        connection.path.setAttribute('class', 'connection-path');

        // 更新标签位置
        const labelPos = this.calculateLabelPosition(start.x, start.y, end.x, end.y);
        const label = connection.label;
        const text = label.querySelector('text');
        const background = label.querySelector('rect');

        text.setAttribute('x', labelPos.x);
        text.setAttribute('y', labelPos.y);

        // 调整背景大小以适应文本
        const textBox = text.getBBox();
        background.setAttribute('x', textBox.x - 4);
        background.setAttribute('y', textBox.y - 2);
        background.setAttribute('width', textBox.width + 8);
        background.setAttribute('height', textBox.height + 4);
    }

    createPath(start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(0.3, distance / 1000); // 根据距离动态调整曲率
        const controlPoint1 = {
            x: start.x + dx * curvature,
            y: start.y + dy * 0.1
        };
        const controlPoint2 = {
            x: start.x + dx * (1 - curvature),
            y: end.y - dy * 0.1
        };

        return `M ${start.x},${start.y} 
                C ${controlPoint1.x},${controlPoint1.y} 
                  ${controlPoint2.x},${controlPoint2.y} 
                  ${end.x},${end.y}`;
    }

    calculateLabelPosition(startX, startY, endX, endY) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        // 计算连接线的角度
        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

        // 根据角度调整标签的垂直偏移
        const offset = 20;
        const adjustedY = midY - (Math.abs(angle) > 45 ? 0 : offset);

        return { x: midX, y: adjustedY, angle: angle };
    }

    updateAllConnections() {
        this.connections.forEach(conn => this.updateConnection(conn));
    }
}

// 定义状态流转关系
const stateTransitions = [
    { from: 'initial', to: 'common', label: '未通过' },
    { from: 'initial', to: 'to_check', label: '需检查' },
    { from: 'to_check', to: 'check_failed', label: '检查失败' },
    { from: 'to_check', to: 'to_submit', label: '检查通过' },
    { from: 'to_submit', to: 'submit_failed', label: '提交失败' },
    { from: 'to_submit', to: 'submitted', label: '提交成功' }
];

// 绘制连接线
function drawConnections() {
    const svg = document.getElementById('connections-container');

    // 清除现有的连接线
    const existingPaths = svg.querySelectorAll('.connection-path, .connection-label, .connection-label-bg');
    existingPaths.forEach(path => path.remove());

    // 获取SVG的位置和尺寸
    const svgRect = svg.getBoundingClientRect();

    stateTransitions.forEach(transition => {
        const fromNode = document.getElementById(`node-${transition.from}`);
        const toNode = document.getElementById(`node-${transition.to}`);

        if (!fromNode || !toNode) return;

        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();

        // 计算相对于SVG的坐标
        const startPoint = {
            x: fromRect.left - svgRect.left + fromRect.width / 2,
            y: fromRect.top - svgRect.top + fromRect.height / 2
        };

        const endPoint = {
            x: toRect.left - svgRect.left + toRect.width / 2,
            y: toRect.top - svgRect.top + toRect.height / 2
        };

        // 创建连接线路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-path');

        // 计算控制点
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;

        // 计算贝塞尔曲线的控制点
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curvature = Math.min(0.3, distance / 1000); // 根据距离动态调整曲率
        const controlPoint1 = {
            x: startPoint.x + dx * curvature,
            y: startPoint.y + dy * 0.1
        };
        const controlPoint2 = {
            x: startPoint.x + dx * (1 - curvature),
            y: endPoint.y - dy * 0.1
        };

        // 设置贝塞尔曲线路径
        path.setAttribute('d', `M ${startPoint.x} ${startPoint.y} 
                              C ${controlPoint1.x} ${controlPoint1.y},
                                ${controlPoint2.x} ${controlPoint2.y},
                                ${endPoint.x} ${endPoint.y}`);
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.style.transition = 'all 0.3s ease-in-out';

        // 创建标签组
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');

        // 设置标签文本
        label.textContent = transition.label;
        label.classList.add('connection-label');

        // 计算标签位置（在曲线的中点）
        const t = 0.5; // 参数t表示曲线上的位置（0到1之间）
        const labelX = Math.pow(1 - t, 3) * startPoint.x +
            3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
            Math.pow(t, 3) * endPoint.x;
        const labelY = Math.pow(1 - t, 3) * startPoint.y +
            3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
            Math.pow(t, 3) * endPoint.y;

        // 设置标签位置和样式
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('dy', '0.35em');
        label.style.transition = 'all 0.3s ease-in-out';

        // 添加到SVG
        svg.appendChild(path);
        labelGroup.appendChild(label);
        svg.appendChild(labelGroup);

        // 获取文本尺寸并设置背景
        const textBox = label.getBBox();
        const padding = 6;
        const cornerRadius = 4;

        labelBg.classList.add('connection-label-bg');
        labelBg.setAttribute('x', textBox.x - padding);
        labelBg.setAttribute('y', textBox.y - padding);
        labelBg.setAttribute('width', textBox.width + padding * 2);
        labelBg.setAttribute('height', textBox.height + padding * 2);
        labelBg.setAttribute('rx', cornerRadius);
        labelBg.setAttribute('ry', cornerRadius);
        labelBg.style.transition = 'all 0.3s ease-in-out';

        // 将背景插入到文本前面
        labelGroup.insertBefore(labelBg, label);
    });
}

// 在窗口大小改变时重新绘制连接线
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(drawConnections, 250); // 添加防抖
});

/**
 * 显示流程图并初始化连接线
 */
function showFlowchart() {
    const flowchartContainer = document.getElementById('flowchart-container');

    // 确保流程图容器可见
    flowchartContainer.style.display = 'block';

    // 添加一个小延迟以确保DOM完全渲染
    setTimeout(() => {
        // 绘制连接线
        drawConnections();

        // 添加淡入动画效果
        flowchartContainer.style.opacity = '0';
        flowchartContainer.style.transform = 'scale(0.95)';
        flowchartContainer.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';

        requestAnimationFrame(() => {
            flowchartContainer.style.opacity = '1';
            flowchartContainer.style.transform = 'scale(1)';
        });
    }, 100);
}
