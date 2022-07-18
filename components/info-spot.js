import { ShowPanelInfo, HidePanelInfo } from "./InfoSpotManagment.js"

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
const temporalRaycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const touch = new THREE.Vector2()
const camera = document.querySelector("#camera").components.camera.camera
const canvas = document.querySelector(".a-canvas")
const structureObjects = []
const hotspotObjects = []

AFRAME.registerComponent('info-spot', {
    schema: {
        title: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string' }
    },
    init: function () {
        let structures = document.querySelectorAll(".structure")
        let hotsposts = document.querySelectorAll(".infoSpot")
        let hotspot = this.el
        let data = this.data
        let title = data.title
        let description = data.description
        let image = data.image

        structures.forEach(structure => structureObjects.push(structure.object3D))
        hotsposts.forEach(hotspot => hotspotObjects.push(hotspot.object3D))

        if(device == "desktop") {
            hotspot.addEventListener('raycaster-intersected', evt => handleEnterHotspot(evt.detail.el, hotspot, title, description, image))
            hotspot.addEventListener('raycaster-intersected-cleared', handleLeaveHotspot)

            window.addEventListener('pointermove', onPointerMove);
        }
        else if(device == "mobile" || device == "tablet") {
            canvas.addEventListener('touchend', handleTouchMobile);
        }
    },
    tick: function () {
        let camera = document.querySelector("#camera")
        this.el.object3D.lookAt(camera.object3D.position)
    }
});

let handleEnterHotspot = (raycaster, hotspot, title, description, image) => {
    let isCorrectRaycaster = raycaster.getAttribute("id") == "cursor-prev-raycast"
    if (!isCorrectRaycaster) { return }

    let hotspotIntersection = raycaster.components.raycaster.getIntersection(hotspot)

    let isBlocked = CheckIfItIsBlocked(hotspotIntersection, structureObjects)
    if (isBlocked) { return }

    ShowPanelInfo(hotspot, hotspotIntersection, title, description, image)
}

let CheckIfItIsBlocked = (hotspotIntersection, structureObjects) => {
    temporalRaycaster.setFromCamera(pointer, camera)
    const structureIntersections = temporalRaycaster.intersectObjects(structureObjects)

    let isBlocked = false
    structureIntersections.forEach(structure => {
        structure.distance < hotspotIntersection.distance && (isBlocked = true)
    })
    return isBlocked
}

let handleLeaveHotspot = () => {
    HidePanelInfo()
}

let handleTouchMobile = (evt) => {
    touch.x = (evt.changedTouches[0].pageX / window.innerWidth) * 2 - 1;
    touch.y = -(evt.changedTouches[0].pageY / window.innerHeight) * 2 + 1;

    temporalRaycaster.setFromCamera(touch, camera)
    const hotspotIntersections = temporalRaycaster.intersectObjects(hotspotObjects)

    let thereIsHotspotIntersection = hotspotIntersections.length > 0
    if (!thereIsHotspotIntersection) { 
        HidePanelInfo()
        return
    }

    let hotspotIntersection
    hotspotIntersections.forEach(intersection => {
        hotspotIntersection = intersection
    })

    let hotspot = hotspotIntersection.object.el
    let data = hotspotIntersection.object.el.components["info-spot"].data
    let title = data.description
    let description = data.description
    let image = data.image

    ShowPanelInfo(hotspot, hotspotIntersection, title, description, image)
}

let onPointerMove = (evt) => {
    pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (evt.clientY / window.innerHeight) * 2 + 1;
}

let InitAFrameHotspots = () => {
    let infoSpotPointers = document.querySelectorAll(".infoSpot")
    infoSpotPointers.forEach(spot => {
        spot.setAttribute("info-spot", "")
    })
}

InitAFrameHotspots()