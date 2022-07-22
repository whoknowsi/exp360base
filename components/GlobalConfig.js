
const touch = new THREE.Vector2()
const pointer = new THREE.Vector2()
const temporalRaycaster = new THREE.Raycaster()
let height = 1.6
let skyHeight = .2
let currentSky
let structuersObj3D = []

const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";   
}

const device = deviceType()

let onPointerMove = (evt) => {
    pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (evt.clientY / window.innerHeight) * 2 + 1;
}

let onTouchMove = (evt) => {
    touch.x = (evt.changedTouches[0].pageX / window.innerWidth) * 2 - 1;
    touch.y = -(evt.changedTouches[0].pageY / window.innerHeight) * 2 + 1;
}

const InitGlobalConfig = () => {
    if(device == "desktop") {
        window.addEventListener('pointermove', onPointerMove)
    }
    else if(device == "mobile" || device == "tablet") {
        document.querySelector("canvas").addEventListener("touchmove", onTouchMove)
    }

    
    document.querySelectorAll(".structure").forEach(structure => structuersObj3D.push(structure.object3D))
}

function Height() {
    return height
}

function SkyMiddleHeight() {
    return skyHeight/2
}