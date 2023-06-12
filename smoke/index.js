function Spark() {
    this.init();
}

Spark.sparksCount = 350;

Spark.prototype.init = function() {
    this.size_of_point = Math.random() * -45 + 60;
    this.timeFromCreation = performance.now();

    const angle = Math.random()+Math.PI*1.35;

    const radius = Math.random() * 2;  
    this.xMax = Math.cos(angle) * radius;
    this.yMax = Math.sin(angle) * radius;
    const multiplier = 5000 + Math.random() * 1000;
    this.dx = -this.xMax / multiplier;
    this.dy = -this.yMax / multiplier;

    this.x = (this.dx*500) % this.xMax;
    this.y = (this.dy*500) % this.yMax;


};

Spark.prototype.move = function(time) {

    const timeShift = time - this.timeFromCreation;
    this.timeFromCreation = time;

    const speed = timeShift;
    this.x += this.dx * speed;
    this.y += this.dy * speed;

    if (Math.abs(this.x) > Math.abs(this.xMax) || Math.abs(this.y) > Math.abs(this.yMax)) {
        this.init();
    }

};


function main() {
    const canvas = document.getElementById("my_canvas");
    gl = canvas.getContext("webgl");    
    if (!gl) {
        exit;
    }
    let sparks = [];
    for (let i = 0; i < Spark.sparksCount; i++) {
        sparks.push(new Spark());
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);


    let programSpark = webglUtils.createProgramFromScripts(gl, ["vertex-shader-spark", "fragment-shader-spark"]);

    let positionAttributeLocationSpark = gl.getAttribLocation(programSpark, "a_position");
    let positionAttributeLocationSparkSize = gl.getAttribLocation(programSpark, "a_size");
    let textureLocationSpark = gl.getUniformLocation(programSpark, "u_texture");
    let pMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_pMatrix");
    let mvMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_mvMatrix");

    let texture = gl.createTexture();
    let image = new Image();
    image.src = "../smoke/smoke.png";
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(drawScene);
    });

    let mvMatrix = mat4.create();
    let pMatrix = mat4.create();


    function drawSparks(positions, sizes_of_points) {
        gl.useProgram(programSpark);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);

        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        let sizesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sizesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes_of_points), gl.STATIC_DRAW);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocationSpark, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);  
        gl.vertexAttribPointer(positionAttributeLocationSpark, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocationSpark);
              
        gl.bindBuffer(gl.ARRAY_BUFFER, sizesBuffer);
        gl.vertexAttribPointer(positionAttributeLocationSparkSize, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocationSparkSize);

        gl.drawArrays(gl.POINTS, 0, positions.length / 3);
    }

    function drawScene(now) {
      
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, -1.9, -3.5]);

        for (let i = 0; i < sparks.length; i++) {
            sparks[i].move(now);
        }

        let positions = [];
        sparks.forEach(function(item) {                          
            positions.push(item.x);
            positions.push(item.y);
            positions.push(0);
        });

        let sizes_of_points = [];
        sparks.forEach(function(item) {                   
            sizes_of_points.push(item.size_of_point);
        });

        drawSparks(positions, sizes_of_points);

        requestAnimationFrame(drawScene);
    }
}
main();