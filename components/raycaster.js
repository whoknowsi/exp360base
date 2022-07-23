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
            this.el.addEventListener('mouseup', () => OnMouseUp(this.raycaster, this.structure))
        }
        else if(device == "tablet" || device == "mobile") {
            this.el.addEventListener('mousedown', () => OnMouseDown())
            this.el.addEventListener('mouseup', () => OnMouseUp(this.raycaster, this.structure))
        }   
    },
    tick: function() {

        if(device == "mobile" || device == "tablet") { return }

        this.raycaster.setFromCamera(pointer, this.camera)
        let intersectionN = this.raycaster.intersectObject(this.structure)
        // temporalRaycaster.setFromCamera(pointer, document.querySelector("a-camera").components.camera.camera)
        // let intersectionN = temporalRaycaster.intersectObject(document.querySelector(".structure").object3D)

        if(intersectionN.length == 0) { return }

        CursorManagment(intersectionN[0], this.cursor)

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

var OnMouseUp = function (raycaster, structure) {
    let userClick = CheckIfUserClick()
    if (userClick) {
        MoveToNextSky(raycaster, structure)
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


function MoveToNextSky(raycaster, structure) {

    if(device == "mobile" || device == "tablet") {
        raycaster.setFromCamera(touch, perspectiveCamera);
    }
    else if(device == "desktop") {
        raycaster.setFromCamera(pointer, perspectiveCamera);
    }

    let intersection = raycaster.intersectObject(structure)[0]
    let existIntersection = intersection != undefined
    if(!existIntersection) { return }

    let intersectingSpots = raycaster.intersectObjects(skySpotObj3D)
    let isClickingOnSpotSky = intersectingSpots.length > 0
    if(isClickingOnSpotSky) { return }

    let cameraContainerPosition = document.querySelector("#cameraContainer").object3D.position
    
    let closestSkySpotDistance = 100000
    let closetsSkySpot

    let skySpots = document.querySelectorAll(".skySpot")
    skySpots.forEach(spot => {
        let spotWorldPosition = new THREE.Vector3()
        spot.object3D.getWorldPosition(spotWorldPosition)

        let distanceCameraSpot = cameraContainerPosition.distanceTo(spotWorldPosition)
        if(distanceCameraSpot > 10) { return }


        let distanceSpotIntersection = spotWorldPosition.distanceTo(intersection.point)
        let distanceCameraIntersection = cameraContainerPosition.distanceTo(intersection.point)
        let angle = Math.acos((distanceSpotIntersection * distanceSpotIntersection - distanceCameraIntersection * distanceCameraIntersection - distanceCameraSpot * distanceCameraSpot) / (-2 * distanceCameraIntersection * distanceCameraSpot))

        temporalRaycaster.setFromCamera(pointer, perspectiveCamera)
        const intersects = temporalRaycaster.intersectObjects(skySpotObj3D)
        let intersected = false 
        if (angle < .7) {

            if (distanceCameraSpot < closestSkySpotDistance) {
                if (intersects.length > 0) {
                    intersects.forEach(intersect => {
                        if (intersect.distance < distanceCameraSpot) {
                            intersected = true
                            return
                        }
                    })
                }
                if (!intersected) {
                    closestSkySpotDistance = distanceCameraSpot
                    closetsSkySpot = spot
                }
            }
        }

    })
    closetsSkySpot != null && closetsSkySpot.click()
}
