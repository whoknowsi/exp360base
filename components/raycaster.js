let intersectingStructure

AFRAME.registerComponent('raycaster-element', {
    dependencies: ['raycaster'],

    init: function () {
        this.camera = document.querySelector("a-camera").components.camera.camera
        this.cursor = document.querySelector("#cursor")
        this.raycaster = new THREE.Raycaster()
        this.structure = document.querySelector(".structure").object3D

        if(device == "desktop") {
            this.el.addEventListener('mousedown', () => OnMouseDown())
            this.el.addEventListener('mouseup', () => OnMouseUp())
        }
        else if(device == "tablet" || device == "mobile") {
            this.el.addEventListener('mousedown', () => OnMouseDown())
            this.el.addEventListener('mouseup', () => OnMouseUp())
        }   
    },
    tick: function() {

        if(device == "mobile" || device == "tablet") { return }

        this.raycaster.setFromCamera(pointer, this.camera)
        let intersection = this.raycaster.intersectObject(this.structure)
        // temporalRaycaster.setFromCamera(pointer, document.querySelector("a-camera").components.camera.camera)
        // let intersectionN = temporalRaycaster.intersectObject(document.querySelector(".structure").object3D)

        if(intersection.length == 0) { return }

        CursorManagment(intersection[0], this.cursor)

        return
    }
})


function CursorManagment(intersection, cursor) {
    let normal = intersection.face.normal;
    let cameraRotationHorizontal = NormalizeAngleInRadians(document.querySelector("#cameraContainer").getAttribute("rotation").y)

    let correctedNormal = normal

    if (normal.x < 0.99 && normal.x > -0.99 && (cameraRotationHorizontal > (Math.PI / 2) && cameraRotationHorizontal < (Math.PI * 3) / 2)) {
        correctedNormal = new THREE.Vector3(-normal.x, normal.y, normal.z)
    }

    cursor.setAttribute("position", intersection.point.x + " " + intersection.point.y + " " + intersection.point.z)
    cursor.setAttribute("rotation", (90 * correctedNormal.y) + " " + (90 * correctedNormal.x) + " " + (90 * correctedNormal.z))
}

var OnMouseDown = function () {
    let camera = document.querySelector("#cameraContainer")
    let cameraRotation = camera.getAttribute("rotation")

    startCamRotation = {
        x: cameraRotation.x,
        y: cameraRotation.y
    }
}

var OnMouseUp = function () {
    let userClick = CheckIfUserClick()
    if (userClick) {
        HandleRaycasterIntersection()
    }
}


function CheckIfUserClick() {
    let delta = .5
    let camera = document.querySelector("#cameraContainer")
    let cameraRotation = camera.getAttribute("rotation")

    if(startCamRotation == null) { return false}

    const diffX = Math.abs(cameraRotation.x - startCamRotation.x);
    const diffY = Math.abs(cameraRotation.y - startCamRotation.y);
    return (diffX < delta && diffY < delta)
}

const HandleRaycasterIntersection = () => {
    let intersectionObj = GetIntersection()
    
    MoveToNextSky(intersectionObj)
    handleClick(intersectionObj)
}

const GetIntersection = () => {
    UpdateRaycaster()

    let structureIntersections = raycaster.intersectObject(structure.object3D)
    let hotSpotIntersections = raycaster.intersectObjects(hotSpotsObj3D)
    let hotSpotIntersection 

    if(hotSpotIntersections.length == 0 && structureIntersections.length == 0) { return null }
    else if (hotSpotIntersections.length == 0) {
        return {
            type: "structure",
            intersection: structureIntersections[0]
        }
    }
    else if(structureIntersections.length == 0) {
        for (let i = 0; i < hotSpotIntersections.length; i++) {
            const hotSpotComponent = hotSpotIntersections[i];
            if(hotSpotComponent.object.el.children.length != 0) { 
                hotSpotIntersection = hotSpotComponent
                break
            }
        }
        return {
            type: "hotSpot",
            intersection: hotSpotIntersection
        }
    }
    else if(structureIntersections[0].distance < hotSpotIntersections[0].distance) {
        return {
            type: "structure",
            intersection: structureIntersections[0]
        }
    }
    else if(structureIntersections[0].distance > hotSpotIntersections[0].distance) {
        for (let i = 0; i < hotSpotIntersections.length; i++) {
            const hotSpotComponent = hotSpotIntersections[i];
            if(hotSpotComponent.object.el.children.length != 0) { 
                hotSpotIntersection = hotSpotComponent
                break
            }
        }
        return {
            type: "hotSpot",
            intersection: hotSpotIntersection
        }
    }
    
    return null
}

function MoveToNextSky(intersectionObj) {
    if(intersectionObj == null) { return }
    if(intersectionObj.type != "structure") { return }

    let closetsSkySpot = GetClosetsSkyIntersectionPoint(intersectionObj.intersection)
    closetsSkySpot != null && closetsSkySpot.click()
}

const GetClosetsSkyIntersectionPoint = (intersection) => {
    let closestSkySpotDistance = 100000
    let closetsSkySpot

    skySpots.forEach(skySpot => {
        let skyWorldPosition = new THREE.Vector3()
        skySpot.object3D.getWorldPosition(skyWorldPosition)
        let distanceBetweenIntersectionAndSkySpot = intersection.point.distanceTo(skyWorldPosition)
        if(distanceBetweenIntersectionAndSkySpot < closestSkySpotDistance) {
            closestSkySpotDistance = distanceBetweenIntersectionAndSkySpot
            closetsSkySpot = skySpot
        }
    })

    return closetsSkySpot
}   

const UpdateRaycaster = () => {
    if(device == "mobile" || device == "tablet") {
        raycaster.setFromCamera(touch, perspectiveCamera);
    }
    else if(device == "desktop") {
        raycaster.setFromCamera(pointer, perspectiveCamera);
    }
    return raycaster
}