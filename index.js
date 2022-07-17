
let camera, raycasterPrev, raycasterEdit
let scene = document.querySelector("#scene")
let cursorPrev;
let collides;
let line;

let cameraRotation;

// Maths
let piRad
let innerWidth
let innerHeight
let magicNumber
let magicNumberX
let magicNumberY
let cosTheta
let senTheta
let cosAlpha
let senAlpha
let previousRotation
let cameraHeight = 1.6


const pointer = new THREE.Vector3();
const radius = 100;

function init() {
    SaveInitialValues()
    document.addEventListener('mousemove', onPointerMove);
    window.addEventListener('resize', OnResize)
}

init();
animate();


function onPointerMove(event) {
    magicNumber = innerHeight + (95*innerHeight/500)

    let rotationCameraYRad = cameraRotation.y / 180
    let rotationCameraXRad = cameraRotation.x / 180

    magicNumberX = innerWidth / magicNumber
    magicNumberY = innerHeight / magicNumber

    cosTheta = (Math.cos(rotationCameraXRad * piRad))
    senTheta = (Math.sin(rotationCameraXRad * piRad))
    cosAlpha = (Math.cos(rotationCameraYRad * piRad))
    senAlpha = (Math.sin(rotationCameraYRad * piRad))
    previousRotation = cameraRotation

    let widthRangeFromMinusOneToOne = ((event.clientX / innerWidth) * 2 - 1)
    let heightRangeFromMinusOneToOne = ((event.clientY / innerHeight) * 2 - 1)

    let centerX = - (senAlpha) * cosTheta
    let centerY = senTheta
    let centerZ = -1 * cosAlpha * cosTheta

    let fixedMovementMouseX = (widthRangeFromMinusOneToOne * magicNumberX) * cosAlpha
    let fixedMovementMouseXForY = (heightRangeFromMinusOneToOne * magicNumberY) * senTheta * -senAlpha
    let fixedMovementMouseY = (heightRangeFromMinusOneToOne * magicNumberY) * cosTheta
    let fixedMovementMouseZForX = (widthRangeFromMinusOneToOne * magicNumberX) * senAlpha
    let fixedMovementMouseZForY = (heightRangeFromMinusOneToOne * magicNumberY) * senTheta * cosAlpha
    
    // Se necesita para compensar el tamaño del cursor
    let fixSizeWidth = 1
    let fixSizeHeight = 1


    pointer.x = (centerX + fixedMovementMouseX + fixedMovementMouseXForY) * fixSizeWidth
    pointer.y = (centerY - fixedMovementMouseY) * fixSizeHeight  + cameraHeight
    pointer.z = (centerZ - fixedMovementMouseZForX - fixedMovementMouseZForY) * fixSizeWidth

    cursorPrev.setAttribute("rotation", camera.getAttribute("rotation").x + " " + camera.getAttribute("rotation").y + + " " + camera.getAttribute("rotation").z)

}

function SaveInitialValues() {
    let position = 0 + " " + cameraHeight + " " + 0

    raycasterPrev = document.querySelector("#cursor-prev-raycast")
    raycasterEdit = document.querySelector("#cursor-edit")
    cursorPrev = document.querySelector("#cursor-prev")
    camera = document.querySelector("#cameraContainer")
    collides = document.querySelectorAll(".collidable")
    line = document.querySelector("#line")
    cameraRotation = camera.getAttribute("rotation")

    cursorPrev.setAttribute("position", position)
    raycasterPrev.setAttribute("position", position)
    camera.setAttribute("position", position)
    
    OnResize()

    // número que me saqué de la galera para que ande bien cuando
    // hay resize de altura
    magicNumber = innerHeight + (95*innerHeight/500)

    piRad = Math.PI
}

function OnResize() {
    innerWidth = window.innerWidth
    innerHeight = window.innerHeight
}

function animate() {

    requestAnimationFrame(animate);
    render();
}

function render() {
    cursorPrev.setAttribute("position", pointer.x + " " + pointer.y + " " + pointer.z)
    raycasterPrev.setAttribute("raycaster", "direction", pointer.x + " " + (pointer.y - cameraHeight) + " " + pointer.z)
}
