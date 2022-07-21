var startCamRotation
let perspectiveCamera

AFRAME.registerComponent('raycaster-listener', {
    init: function () {
        perspectiveCamera = document.querySelector("a-camera").components.camera.camera

        this.cornerValue = 0.1
        this.cursor = document.querySelector("#cursor")

        
        this.el.addEventListener('raycaster-intersected', evt => {
            this.raycaster = evt.detail.el;
            AddTarget(this.el);
        })
        this.el.addEventListener('raycaster-intersected-cleared', evt => {
            //this.cursor.setAttribute("visible", "false")
            this.raycaster = null;
            RemoveTarget(this.el);
        })
        

        //.addEventListener('touchstart', onMouseMove)

        if(device == "desktop") {
            this.el.addEventListener('mousedown', () => OnMouseDown())
            this.el.addEventListener('mouseup', (evt) => OnMouseUp(evt, this.el))
        }
        else if(device == "tablet" || device == "mobile") {
            this.el.addEventListener('mousedown', () => OnMouseDown())
            this.el.addEventListener('mouseup', (evt) => OnMouseUp(evt, this.el))
        }   
        
        // this.el.addEventListener('click', evt => {
        //     if (evt.detail.cursorEl.getAttribute("id") == "cursor-prev-raycast") {
        //         //ChangeSky(data, el, sky1, sky2, radiusSkyProportion)

        //     }

        // })
    },
    tick: function () {

        // let target = document.querySelector(".structure")
        // temporalRaycaster.setFromCamera(pointer, perspectiveCamera)
        // const hotspotIntersections = temporalRaycaster.intersectObject(target.object3D)
    
        // let thereIsHotspotIntersection = hotspotIntersections.length > 0
        // if (!thereIsHotspotIntersection) { return }
    
        // cursorPrev.setAttribute("visible", "true")
        if(device == "mobile" || device == "tablet") { return }
        
        if(this.raycaster == null) { return }
        

        let intersection = this.raycaster.components.raycaster.getIntersection(GetCurrentTarget())
        if(intersection == null) { return }

        // // CursorManagment(hotspotIntersections[0], null, 1)
        CursorManagment(intersection, this.cursor)
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

var OnMouseUp = function (evt, el) {
    let userClick = CheckIfUserClick()
    if (userClick) {
        MoveToNextSky(evt, el)
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


function MoveToNextSky(evt, el) {
    let cameraObj3D = document.querySelector("a-camera").components.camera.camera
    let cameraContainerPosition = document.querySelector("#cameraContainer").object3D.position

    if(device == "mobile" || device == "tablet") {
        temporalRaycaster.setFromCamera(touch, cameraObj3D);
    }
    else if(device == "desktop") {
        temporalRaycaster.setFromCamera(pointer, cameraObj3D);
    }

    let intersection = temporalRaycaster.intersectObject(el.object3D)[0]
    if(intersection == null) { return }
    
    let closestSkySpotDistance = 100000
    let closetsSkySpot

    let skySpots = document.querySelectorAll(".skySpot")
    skySpots.forEach(spot => {
        let distanceSpotIntersection = spot.object3D.position.distanceTo(intersection.point)
        let distanceCameraIntersection = cameraContainerPosition.distanceTo(intersection.point)
        let distanceCameraSpot = cameraContainerPosition.distanceTo(spot.object3D.position)
        let angle = Math.acos((distanceSpotIntersection * distanceSpotIntersection - distanceCameraIntersection * distanceCameraIntersection - distanceCameraSpot * distanceCameraSpot) / (-2 * distanceCameraIntersection * distanceCameraSpot))

        let structures = document.querySelectorAll(".structure")
        let array = []

        structures.forEach(structure => array.push(structure.object3D))
        temporalRaycaster.setFromCamera(pointer, cameraObj3D)
        const intersects = temporalRaycaster.intersectObjects(array)
        let intersected = false 
        if (angle < .7) {
            if (distanceCameraSpot < closestSkySpotDistance && distanceCameraSpot < 10) {
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
