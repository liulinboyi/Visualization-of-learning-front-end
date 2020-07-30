// const dataSource = 'https://s5.ssl.qhres.com/static/b0695e2dd30daa64.json';

/* globals d3 */
(async function () {
    const dataSource = "./city.json"

    const data = await (await fetch(dataSource)).json();
    const regions = d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
        .size([1600, 1600])
        .padding(3);

    const root = pack(regions);

    const svgroot = document.querySelector('svg');

    function draw(parent, node, {
        fillStyle = 'rgba(0, 0, 0, 0.2)',
        textColor = 'white'
    } = {}) {
        const children = node.children;
        const {
            x,
            y,
            r
        } = node;
        // document.createElementNS 方法来创建 SVG 元素的
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fillStyle);
        circle.setAttribute('data-name', node.data.name);
        parent.appendChild(circle);
        if (children) {
            // SVG 的 g 元素表示一个分组，我们可以用它来对 SVG 元素建立起层级结构。而且，如果我们给 g 元素设置属性，那么它的子元素会继承这些属性。
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            for (let i = 0; i < children.length; i++) {
                draw(group, children[i], {
                    fillStyle,
                    textColor
                });
            }
            group.setAttribute('data-name', node.data.name);
            parent.appendChild(group);
        } else {
            // 文本
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('fill', textColor);
            text.setAttribute('font-family', 'Arial');
            text.setAttribute('font-size', '1.5rem');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            const name = node.data.name;
            text.textContent = name;
            parent.appendChild(text);
        }
    }

    draw(svgroot, root);

    const titleEl = document.getElementById('title');

    function getTitle(target) {
        const name = target.getAttribute('data-name');
        if (target.parentNode && target.parentNode.nodeName === 'g') {
            const parentName = target.parentNode.getAttribute('data-name');
            return `${parentName}-${name}`;
        }
        return name;
    }

    let activeTarget = null;
    svgroot.addEventListener('mousemove', (evt) => {
        let target = evt.target;
        if (target.nodeName === 'text') target = target.previousSibling;
        if (activeTarget !== target) {
            if (activeTarget) activeTarget.setAttribute('fill', 'rgba(0, 0, 0, 0.2)');
        }
        target.setAttribute('fill', 'rgba(0, 128, 0, 0.1)');
        titleEl.textContent = getTitle(target);
        activeTarget = target;
    });

    const svgString = new XMLSerializer().serializeToString(document.querySelector('#svg'));
    console.log(svgString, 'svgString');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    const svgElement = document.querySelector('#svg');
    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;

    const DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8"
    });
    var url = DOMURL.createObjectURL(svg);
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        const png = canvas.toDataURL("image/png");
        console.log(png) // base64 的 url
        document.querySelector('#png-container').innerHTML = '<img src="' + png + '"/>';
        download.href = png;
        DOMURL.revokeObjectURL(png);
    };
    img.src = url;

}());