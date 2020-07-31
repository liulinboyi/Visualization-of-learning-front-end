function drew(allpoints, type, ele) {
  // 1. 创建上下文
  // const canvas = document.querySelector('canvas');
  const canvas = ele;
  const gl = canvas.getContext('webgl');

  // 2. 创建 WebGL 程序

  // 两个着色器（Shader）
  // 顶点和图元
  const vertex = `
  attribute vec2 position;
  varying vec3 color;

  void main() {
    gl_PointSize = 10.0;
    // gl_Position = vec4(position * 0.5, 1.0, 1.0); // 周长缩小一半
    // gl_Position = vec4(position, 1.0, 1.0);
    gl_Position = vec4(position, 1.0, 1.0);
    /*
    -1, -1,
    0, 1,
    1, -1,
    */

    color = vec3(0.5 + position * 0.5, 0.0);
    // [-1,-1] => [0.5 + -1 * 0.5, 0.5 + -1 * 0.5, 0.0] => [0,0,0]
    // [0,1] => [0.5 + 0 * 0.5, 0.5 + 1 * 0.5, 0.0] => [0.5,1,0]
    // [1,-1] => [0.5 + 1 * 0.5, 0.5 + -1 * 0.5, 0.0] => [1,0,0]
  }
`;


  const fragment = `
  precision mediump float;
  varying vec3 color; //将 color 通过 varying 变量传给片元着色器
  void main()
  {
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }    
`;



  // debugger
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertex);
  gl.compileShader(vertexShader);


  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragment);
  gl.compileShader(fragmentShader);


  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);


  gl.useProgram(program);


  const points = new Float32Array(allpoints);

  console.log(points, 'points');

  const bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);


  const vPosition = gl.getAttribLocation(program, 'position'); //获取顶点着色器中的position变量的地址
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
  gl.enableVertexAttribArray(vPosition); //激活这个变量


  gl.clear(gl.COLOR_BUFFER_BIT);
  console.log(points.length);
  // gl.drawArrays(gl.TRIANGLES, 0, points.length);
  gl.drawArrays(gl[type], 0, points.length / 2) // 点的数量一定要/2，否则点的数量不对

  console.log(gl, 'gl');
}

// drew([
//   0, 1,
//   1, -1,
//   -1, -1,
// ])

// drew([
//   -1, -1,
//   1, -1,
//   0, -2,
// ])

function create2CircleVertex(x, y, r, R, n) {
  const sin = Math.sin;
  const cos = Math.cos;
  const perAngel = Math.PI / n;
  const positionArray = [];
  for (let i = 0; i < 2 * n; i++) {
    const angel = i * perAngel;
    if (i % 2 !== 0) {
      const Rx = x + R * cos(angel);
      const Ry = y + R * sin(angel);
      positionArray.push(Rx, Ry);
    } else {
      const rx = x + r * cos(angel);
      const ry = y + r * sin(angel);
      positionArray.push(rx, ry);
    }
  }
  return new Float32Array(positionArray);
}

// 生成多边形顶点坐标数组的函数
function createCircleVertex(x, y, r, n) {
  const sin = Math.sin;
  const cos = Math.cos;
  const perAngel = (2 * Math.PI) / n; // 这里n为4的话，是弧度制2PI / 4 => PI / 2 单位长度
  console.log(perAngel, 'perAngel');
  const positionArray = [];
  for (let i = 0; i < n; i++) {
    const angel = i * perAngel; // i 取值 0,1,2,3 => 0,PI / 2,PI,3*PI / 2
    const nx = r * cos(angel); // 半径为0.5 
    const ny = r * sin(angel);
    console.log([nx, ny], `PI * ${2 / n * i}`);
    positionArray.push(nx, ny);
  }
  // return new Float32Array(positionArray);
  return positionArray;

}

// 正八边形 
// const points = createCircleVertex(0, 0, 0.5, 8);、
// 正四边形
const points = createCircleVertex(0, 0, 0.5, 9);

// points.push(...[0, 0])
// console.log(points, 'points');

// drew(points, 'POINTS')
drew([0.5, 0, 0, 0.5, -0.5, 0, 0, -0.5], 'LINE_LOOP', c1)

drew(points, 'LINE_LOOP', c2)


// drew([
//   0, 1,
//   1, -1,
//   -1, -1,
// ], 'LINE_LOOP')