let cameraEl
let camera
let canvas
let hotSpotIsClicked
let currentShowedHotSpot

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

        let hotspot = this.el
        let data = this.data
        let title = data.title
        let description = data.description
        let image = data.image

        if(device == "desktop") {
            hotspot.addEventListener('raycaster-intersected', evt => handleEnterHotspot(evt.detail.el, hotspot, title, description, image))
            hotspot.addEventListener('raycaster-intersected-cleared', handleLeaveHotspot)
        }
    },
    tick: function () {
        FaceHotspotToCamera(this.el)
        if(currentShowedHotSpot != null) {
            MovePanel(currentShowedHotSpot)
        }
    }
})

let handleEnterHotspot = (raycaster, hotspot, title, description, image) => {
    hotSpotIsClicked = false
    let hotspotIntersection = raycaster.components.raycaster.getIntersection(hotspot)

    let isBlocked = CheckIfItIsBlocked(hotspotIntersection, pointer)
    if (isBlocked) { return }

    ShowPanelInfo(hotspotIntersection, title, description, image)
}

let CheckIfItIsBlocked = (hotspotIntersection, cursorPosition) => {
    temporalRaycaster.setFromCamera(cursorPosition, camera)
    let structures = document.querySelector(".structure")
    const structureIntersections = temporalRaycaster.intersectObject(structures.object3D)

    let isBlocked = false
    structureIntersections.forEach(structure => {
        structure.distance < hotspotIntersection.distance && (isBlocked = true)
    })
    return isBlocked
}

let handleLeaveHotspot = () => {
    if(!hotSpotIsClicked) { HidePanelInfo() }
}

let handleClick = (intersectionObj) => {

    let thereIsHotspotIntersection = (intersectionObj != null && intersectionObj.type == "hotSpot")
    if (!thereIsHotspotIntersection) { 
        hotSpotIsClicked = false
        HidePanelInfo()
        return
    }

    hotSpotIsClicked = true

    let hotspotIntersection = intersectionObj.intersection
    let data = hotspotIntersection.object.el.components["hot-spot"].data
    let title = data.title
    let description = data.description
    let image = data.image

    ShowPanelInfo(hotspotIntersection, title, description, image)
}

let FaceHotspotToCamera = (hotspot) => {
    hotspot.object3D.lookAt(cameraEl.parentElement.object3D.position)
}

let innerWidth, innerHeight
let point
let angleBetweenXandZ
let panel
let angleBetweenHorizontalAndY
let fov = {
    horizontal: 2,
    vertical: .8
}
let relativeAngle = 0
let structureContainerPosition

function ShowPanelInfo(intersection, title, description, image) {

    let existPanel = document.querySelector(".infoPanel")
    if(existPanel != null) existPanel.remove()
    CreatePanel(title, description, image, intersection.object)

}

function CreatePanel(title, description, image, target) {
    panel != null && panel.remove()

    panel = document.createElement("div")
    panel.setAttribute("class", "infoPanel")
    
    let containsTitle = (title != "")
    if(containsTitle) {
        let titleEl = document.createElement("h2")
        titleEl.textContent = title
        panel.appendChild(titleEl)
    }

    let containsDescription = (description != "")
    if(containsDescription) {
        let descriptionEl = document.createElement("p")
        descriptionEl.textContent = description
        panel.appendChild(descriptionEl)
    }

    let containsImage = (image != "" && image != undefined)
    if(containsImage) {
        let imageEl = document.createElement("img")
        imageEl.src = "./img/" + image
        panel.appendChild(imageEl)
    }

    document.body.appendChild(panel)
    currentShowedHotSpot = target
    MovePanel(target)
}

var MovePanel = function(target) {
    let transform = toScreenPosition(target)
    panel.style.transform = `translate(${transform.x}px, ${transform.y}px)`
}

function HidePanelInfo() {
    currentShowedHotSpot = null
    document.removeEventListener("mousemove", MovePanel)
    panel != null && panel.remove()
}

function toScreenPosition(obj)
{
    let camera = document.querySelector("a-camera").components.camera.camera
    var vector = new THREE.Vector3()

    var widthHalf = 0.5*window.innerWidth
    var heightHalf = 0.5*window.innerHeight

    obj.updateMatrixWorld()
    vector.setFromMatrixPosition(obj.matrixWorld)
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf
    vector.y = - ( vector.y * heightHalf ) + heightHalf

    if(vector.z > 1) {
        vector.x = 10000
        vector.y = 10000
    }
    return { 
        x: vector.x,
        y: vector.y
    }
}






