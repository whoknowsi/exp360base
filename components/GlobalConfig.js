
const touch = new THREE.Vector2()
const pointer = new THREE.Vector2()
const temporalRaycaster = new THREE.Raycaster()
const height = 1.6
const skyHeight = .2
const maxTraslationSky = 40
let currentSky
const skySpots = []
const hotSpotsObj3D = []
let structure
let perspectiveCamera
const raycaster = new THREE.Raycaster()

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
    
    document.querySelectorAll(".skySpot").forEach(spot => skySpots.push(spot))
    document.querySelectorAll(".hotSpot").forEach(hotSpot => hotSpotsObj3D.push(hotSpot.object3D))
    structure = document.querySelector(".structure")
}

function Height() {
    return height
}

function SkyMiddleHeight() {
    return skyHeight/2
}