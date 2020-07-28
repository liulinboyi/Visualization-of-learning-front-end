const dataSource = 'https://s5.ssl.qhres.com/static/b0695e2dd30daa64.json';
(async function () {
    const canvas = document.querySelector('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    const data = await (await fetch(dataSource)).json();

    let mousePosition = [-1, -1];

    const regions = d3
        .hierarchy(data)
        .sum((d) => 1)
        .sort((a, b) => b.value - a.value);

    const pack = d3.pack().size([1600, 1600]).padding(3);

    const root = pack(regions);

    const TAU = 2 * Math.PI;

    /**
     * 计算鼠标和圆心的距离
     * 这里为了方便就没有开平方
     * @param {*} point1 
     * @param {*} point2 
     */
    const getDistance = (point1, point2) => {
        return Math.pow((point1[0] - point2[0]), 2) + Math.pow((point1[1] - point2[1]), 2);
    }

    const draw = (
        ctx,
        node, {
            fillStyle = 'rgba(0, 0, 0, 0.2)',
            textColor = 'white'
        } = {}
    ) => {
        const children = node.children;
        const {
            x,
            y,
            r
        } = node;

        // 获得距离进行比较，是否小于半径
        const distance = getDistance(mousePosition, [x, y]);
        if (distance < (r * r) && !children) {
            // console.log(mousePosition);
            // console.log(distance, 'distance');

            fillStyle = 'red'; // 设置背景颜色
        }

        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();

        if (children) {
            children.forEach((child) => {
                draw(ctx, child);
            });
        } else {
            const name = node.data.name;
            ctx.fillStyle = textColor;
            ctx.font = '1.5rem Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name, x, y);
        }
    };

    draw(context, root);

    // 重新渲染
    const redraw = () => {
        context.clearRect(0, 0, 1600, 1600);
        draw(context, root);
    }

    let lastIsInside = false;


    // 初始进入页面的页面滚动距离
    let originScrollDate = [window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop, window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft]

    document.addEventListener('mousemove', (e) => {

        // 顶部滚动距离
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        // 左边滚动距离
        let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        // 现在的距离和初始进入页面的顶部滚动距离的差值
        let restTop = Math.floor(originScrollDate[0]) - Math.floor(scrollTop) * (1600 / canvas.offsetHeight)
        // console.log(originScrollDate[0] - scrollTop, originScrollDate);
        // 现在的距离和初始进入页面的左边滚动距离的差值
        let restLeft = Math.floor(originScrollDate[1] - scrollLeft) * (1600 / canvas.offsetWidth)
        // 鼠标坐标
        mousePosition = [(e.clientX - canvasRect.left) / (canvas.offsetWidth / 1600) - restLeft, (e.clientY - canvasRect.top) / (canvas.offsetHeight / 1600) - restTop];
        // console.log(mousePosition, 'mousePosition');
        let isInside = false;
        const judgeIsInside = (node) => {
            const children = node.children;
            const {
                x,
                y,
                r
            } = node;

            if (children) {
                children.forEach((child) => {
                    judgeIsInside(child);
                });
            } else {
                const distance = getDistance(mousePosition, [x, y]);
                if (distance < r * r) {
                    isInside = true;
                    return;
                }
            }
        }
        judgeIsInside(root);
        console.log(lastIsInside, 'lastIsInside', isInside, 'isInside');
        if (isInside || isInside !== lastIsInside) {
            redraw();
        }
        lastIsInside = isInside;
    })
})();