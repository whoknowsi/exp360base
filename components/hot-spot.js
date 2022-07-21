let cameraEl
let camera
let canvas
let structureObjects
let hotspotObjects

AFRAME.registerComponent('hot-spot', {
    schema: {
        title: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string' }
    },
    init: function () {
        cameraEl = document.querySelector("a-camera")
        camera = cameraEl.components.camera.camera
        canvas = document.querySelector(".a-canvas")
        structureObjects = []
        hotspotObjects = []


        let structures = document.querySelectorAll(".structure")
        let hotsposts = document.querySelectorAll(".hotSpot")
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
        }
        else if(device == "mobile" || device == "tablet") {
            canvas.addEventListener('touchend', handleTouchMobile);
        }
    },
    tick: function () {
        FaceHotspotToCamera(this.el)
    }
})

let handleEnterHotspot = (raycaster, hotspot, title, description, image) => {
    let hotspotIntersection = raycaster.components.raycaster.getIntersection(hotspot)

    let isBlocked = CheckIfItIsBlocked(hotspotIntersection, structureObjects, pointer)
    if (isBlocked) { return }

    ShowPanelInfo(hotspot, hotspotIntersection, title, description, image)
}

let handleLeaveHotspot = () => {
    HidePanelInfo()
}

let handleTouchMobile = (evt) => {
    onTouchMove(evt)
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

    let isBlocked = CheckIfItIsBlocked(hotspotIntersection, structureObjects, touch)
    if (isBlocked) { return }

    let hotspot = hotspotIntersection.object.el
    let data = hotspotIntersection.object.el.components["hot-spot"].data
    let title = data.description
    let description = data.description
    let image = data.image

    ShowPanelInfo(hotspot, hotspotIntersection, title, description, image)
}



let CheckIfItIsBlocked = (hotspotIntersection, structureObjects, cursorPosition) => {
    temporalRaycaster.setFromCamera(cursorPosition, camera)
    let structures = document.querySelector(".structure")
    const structureIntersections = temporalRaycaster.intersectObject(structures.object3D)

    let isBlocked = false
    structureIntersections.forEach(structure => {
        structure.distance < hotspotIntersection.distance && (isBlocked = true)
    })
    return isBlocked
}

let FaceHotspotToCamera = (hotspot) => {
    hotspot.object3D.lookAt(cameraEl.parentElement.object3D.position)
}

let InitAFrameHotspots = () => {
    let infoSpotPointers = document.querySelectorAll(".infoSpot")
    infoSpotPointers.forEach(spot => {
        spot.setAttribute("info-spot", "")
    })
}

// InitAFrameHotspots()