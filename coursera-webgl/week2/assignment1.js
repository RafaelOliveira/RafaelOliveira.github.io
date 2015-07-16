"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;
var angle = 25;
var isGasket = false;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    start();

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function start()
{
    //  Initialize our data for the base triangle
    var vertices = [
        vec2( -0.7, -0.7 ),
        vec2(  0.0,  0.7 ),
        vec2(  0.7, -0.7 )
    ];

    points = [];

    if (NumTimesToSubdivide > 0)
    {
        divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);
        twist();
    }
    else
    {
        for (var i = 0; i < vertices.length; i++)
            points.push(vertices[i]);
    }
}

function triangle( a, b, c )
{
    // using the values instead of the vectors to avoid some problems
    // https://class.coursera.org/webgl-001/forum/thread?thread_id=62

    points.push( [a[0], a[1]], [b[0], b[1]], [c[0], c[1]] );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        count--;

        // four new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        
        if (!isGasket)
            divideTriangle( ab, bc, ac, count );
    }
}

function twist()
{
    // temp positions
    var tx = 0;
    var ty = 0;
    
    // rotation angle
    var angleRad = radians(angle);

    // distance from origin
    var d = 0;

    for (var i = 0; i < points.length; i++)
    {
        d = Math.sqrt(Math.pow(points[i][0], 2) + Math.pow(points[i][1], 2));
        tx = (points[i][0] * Math.cos(d * angleRad)) - (points[i][1] * Math.sin(d * angleRad));
        ty = (points[i][0] * Math.sin(d * angleRad)) + (points[i][1] * Math.cos(d * angleRad));

        points[i][0] = tx;
        points[i][1] = ty; 
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function renderChangedPoints()
{
    start();
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    render();
}

function changeSubdivisions()
{
    var subdInput = document.getElementById('subdivisionsInput');

    // updating the label
    document.getElementById('subdivisionsLabel').innerHTML = subdInput.value;

    NumTimesToSubdivide = subdInput.value;
    renderChangedPoints();
}

function changeAngle()
{
    var angleInput = document.getElementById('angleInput');

    if (angleInput.value != "")
        angle = angleInput.value;
    else
    {
        angle = 0;
        angleInput.value = angle;
    }

    renderChangedPoints();
}

function changeTriangleType()
{
    var gasketInput = document.getElementById('gasketInput');

    isGasket = gasketInput.checked;
    renderChangedPoints();
}