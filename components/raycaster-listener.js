import { RemoveTarget, AddTarget, GetCurrentTarget, MapInterval, NormalizeAngleInRadians } from "./helper.js"

var startCamRotation

var cursorPrev
var mouse = new THREE.Vector2();

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

var device = deviceType()

if(device == "mobile" || device == "tablet") {
    let camera = document.querySelector("#camera")
    camera.removeAttribute("camera-check")
    camera.removeAttribute("look-controls")
    camera.setAttribute("look-controls", "")
    document.querySelector("#cursor-prev-raycast").setAttribute("cursor", "rayOrigin: mouse")
}

AFRAME.registerComponent('raycaster-listener', {
    init: function () {

        
        this.cornerValue = 0.1
        cursorPrev = document.querySelector("#cursor-prev")


        this.el.addEventListener('raycaster-intersected', evt => {
            this.raycaster = evt.detail.el;
            AddTarget(this.el);
        })
        this.el.addEventListener('raycaster-intersected-cleared', evt => {
            cursorPrev.setAttribute("visible", "false")
            this.raycaster = null;
            RemoveTarget(this.el);
        })
        
        document.querySelector(".a-canvas").addEventListener('touchstart', onMouseMove)

        this.el.addEventListener('mousedown', () => OnMouseDown())
        this.el.addEventListener('mouseup', (evt) => OnMouseUp(evt, this.el))
        // this.el.addEventListener('click', evt => {
        //     if (evt.detail.cursorEl.getAttribute("id") == "cursor-prev-raycast") {
        //         //ChangeSky(data, el, sky1, sky2, radiusSkyProportion)

        //     }

        // })
    },
    tick: function () {

        if (!this.raycaster) { return }

        let target = GetCurrentTarget()

        if (target == null && this.raycaster != null) {
            AddTarget(this.el);
            target = this.el
        }

        else if (target != null) {
            this.intersection = this.raycaster.components.raycaster.getIntersection(target);
        }

        if (!this.intersection) { return }

        cursorPrev.setAttribute("visible", "true")
        CursorManagment(this.intersection, target, this.cornerValue)
    }
});

function onMouseMove(event) {
    mouse.x = (event.targetTouches[0].pageX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
}

function CursorManagment(intersection, target, cornerValue) {
    let normal = intersection.face.normal;
    let distance = intersection.distance;
    let cornersToRotate = target.getAttribute("rotate-corner")
    let scale = 3 / (1 + distance * 2)
    let edge
    let cameraRotationHorizontal = NormalizeAngleInRadians(document.querySelector("#cameraContainer").getAttribute("rotation").y)


    // Esta parte es la que genera que se vaya curvando en los bordes de las cajas el punto
    // Hay que ver si dejarla porque es muy sutíl, además habría que configurar más cosas
    // Tendría que saber cada caja qué es lo que tiene al lado para saber qué esquinas son
    // las que generan esa curvatura en el cursor

    if (cornersToRotate == "") {
        edge = new THREE.Vector3(0, 0, 0);
    } else {
        edge = RotateOnCorners(target, intersection, cornerValue)
    }

    let correctedNormal = normal

    if (normal.x < 0.99 && normal.x > -0.99 && (cameraRotationHorizontal > (Math.PI / 2) && cameraRotationHorizontal < (Math.PI * 3) / 2)) {
        correctedNormal = new THREE.Vector3(-normal.x, normal.y, normal.z)
    }

    cursorPrev.setAttribute("position", intersection.point.x + " " + intersection.point.y + " " + intersection.point.z)
    cursorPrev.setAttribute("rotation", (90 * correctedNormal.y) + " " + (90 * correctedNormal.x) + " " + (90 * correctedNormal.z))
}

function RotateOnCorners(target, intersection, cornerValue) {
    let rangeValue = 0.0000001;

    let targetWidth = target.getAttribute("width")
    let targetHeight = target.getAttribute("height")
    let targetDepth = target.getAttribute("depth")

    let localPositionX = intersection.point.x - (target.getAttribute("position").x - target.getAttribute("width") / 2)
    let localPositionY = intersection.point.y - (target.getAttribute("position").y - target.getAttribute("height") / 2)
    let localPositionZ = intersection.point.z - (target.getAttribute("position").z - target.getAttribute("depth") / 2)

    let positionRelativeBorderStartX = Math.abs(localPositionX - targetWidth)
    let positionRelativeBorderStartY = Math.abs(localPositionY - targetHeight)
    let positionRelativeBorderStartZ = Math.abs(localPositionZ - targetDepth)
    let positionRelativeBorderEndX = targetWidth - positionRelativeBorderStartX
    let positionRelativeBorderEndY = targetHeight - positionRelativeBorderStartY
    let positionRelativeBorderEndZ = targetDepth - positionRelativeBorderStartZ

    let edge = {
        x: 0,
        y: 0
    }

    if (positionRelativeBorderStartX >= -rangeValue && positionRelativeBorderStartX <= rangeValue) {
        if (positionRelativeBorderStartY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartY), 0, cornerValue, -45, 0);
        }
        if (positionRelativeBorderStartZ < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderStartZ), 0, cornerValue, -45, 0);
        }

        if (positionRelativeBorderEndY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndY), 0, cornerValue, 45, 0);
        }
        if (positionRelativeBorderEndZ < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderEndZ), 0, cornerValue, 45, 0);
        }
    }
    if (positionRelativeBorderStartY >= -rangeValue && positionRelativeBorderStartY <= rangeValue) {
        if (positionRelativeBorderStartX < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartX), 0, cornerValue, 45, 0);
            edge.x = 90
        }
        if (positionRelativeBorderStartZ < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartZ), 0, cornerValue, 45, 0);
        }

        if (positionRelativeBorderEndX < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndX), 0, cornerValue, -45, 0);
            edge.x = 90
        }
        if (positionRelativeBorderEndZ < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndZ), 0, cornerValue, -45, 0);
        }
    }
    if (positionRelativeBorderStartZ >= -rangeValue && positionRelativeBorderStartZ <= rangeValue) {
        if (positionRelativeBorderStartX < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderStartX), 0, cornerValue, 45, 0);
        }
        if (positionRelativeBorderStartY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartY), 0, cornerValue, -45, 0);
        }

        if (positionRelativeBorderEndX < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderEndX), 0, cornerValue, -45, 0);
        }
        if (positionRelativeBorderEndY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndY), 0, cornerValue, 45, 0);
        }
    }

    if (positionRelativeBorderEndX >= -rangeValue && positionRelativeBorderEndX <= rangeValue) {
        if (positionRelativeBorderStartY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartY), 0, cornerValue, -45, 0);
        }
        if (positionRelativeBorderStartZ < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderStartZ), 0, cornerValue, 45, 0);
        }

        if (positionRelativeBorderEndY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndY), 0, cornerValue, 45, 0);
        }
        if (positionRelativeBorderEndZ < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderEndZ), 0, cornerValue, -45, 0);
        }
    }
    if (positionRelativeBorderEndY >= -rangeValue && positionRelativeBorderEndY <= rangeValue) {
        if (positionRelativeBorderStartX < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartX), 0, cornerValue, -45, 0);
            edge.x = 90
        }
        if (positionRelativeBorderStartZ < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartZ), 0, cornerValue, -45, 0);
        }

        if (positionRelativeBorderEndX < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndX), 0, cornerValue, 45, 0);
            edge.x = 90
        }
        if (positionRelativeBorderEndZ < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndZ), 0, cornerValue, 45, 0);
        }
    }
    if (positionRelativeBorderEndZ >= -rangeValue && positionRelativeBorderEndZ <= rangeValue) {
        if (positionRelativeBorderStartX < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderStartX), 0, cornerValue, -45, 0);
        }
        if (positionRelativeBorderStartY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderStartY), 0, cornerValue, 45, 0);
        }

        if (positionRelativeBorderEndX < cornerValue) {
            edge.x = MapInterval(Math.abs(positionRelativeBorderEndX), 0, cornerValue, 45, 0);
        }
        if (positionRelativeBorderEndY < cornerValue) {
            edge.y = MapInterval(Math.abs(positionRelativeBorderEndY), 0, cornerValue, -45, 0);
        }
    }

    return edge
}

// Necesario para que se ejecute el init
let query;
if (query == null) {
    query = document.querySelectorAll(".collidable")
    for (let i = 0; i < query.length; i++) {

        const item = query[i];
        item.setAttribute('raycaster-listener', '');

    }
}

export function ChangeTargetEditRaycaster(className) {
    let raycaster = document.querySelector("#cursor-edit")
    raycaster.setAttribute("raycaster", "objects", className)
}

export function ChangeTargetEditRaycasterMouse(className) {
    let raycaster = document.querySelector("#raycaster-mouse-edit")
    raycaster.setAttribute("raycaster", "objects", className)
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

function MoveToNextSky(evt, el) {

    let cameraContainer = document.querySelector("#cameraContainer").object3D
    let camera = document.querySelector("#camera").object3D
    var vector = new THREE.Vector3(0, 0, -1)
    vector = camera.localToWorld(vector)
    vector.sub(cameraContainer.position) // Now vector is a unit vector with the same direction as the camera

    let newRaycaster = new THREE.Raycaster();
    let cameraCAMERA = document.querySelector("#camera").components.camera
    newRaycaster.setFromCamera(mouse, cameraCAMERA.camera);
    let structureContainerPosition = document.querySelector("#structure-container").getAttribute("position")
    let intersection 

    if(device == "mobile" || device == "tablet") {
        intersection = newRaycaster.intersectObject(el.object3D)[0]
        if(intersection == null) { return }
    }
    else if(device == "desktop") {
        let raycaster = document.querySelector("#cursor-prev-raycast").components.raycaster
        intersection = raycaster.getIntersection(el)
        if (intersection == null) { return }
    }

    let point = {
        x: intersection.point.x - structureContainerPosition.x,
        y: intersection.point.y - structureContainerPosition.y,
        z: intersection.point.z - structureContainerPosition.z
    }
    let skySpots = document.querySelectorAll(".skyChanger")
    let closestSkySpotDistance = 100000
    let closetsSkySpot

    skySpots.forEach(spot => {
        let spotPosition = spot.getAttribute("position")
        let spotPositionAbsolute = {
            x: spotPosition.x + structureContainerPosition.x,
            y: spotPosition.y + structureContainerPosition.y,
            z: spotPosition.z + structureContainerPosition.z
        }
        let distance = Math.sqrt((point.x - spotPosition.x) * (point.x - spotPosition.x) +
            (point.y - spotPosition.y) * (point.y - spotPosition.y) +
            (point.z - spotPosition.z) * (point.z - spotPosition.z))

        let a = distance
        let b = Math.sqrt(intersection.point.x * intersection.point.x + intersection.point.y * intersection.point.y + intersection.point.z * intersection.point.z)
        let c = Math.sqrt(spotPositionAbsolute.x * spotPositionAbsolute.x + spotPositionAbsolute.y * spotPositionAbsolute.y + spotPositionAbsolute.z * spotPositionAbsolute.z)
        let angle = Math.acos((a * a - b * b - c * c) / (-2 * b * c))
        let direction = new THREE.Vector3(spotPositionAbsolute.x, spotPositionAbsolute.y, spotPositionAbsolute.z)
        let modulo = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z)
        let directionUnit = new THREE.Vector3(direction.x / modulo, direction.y / modulo, direction.z / modulo)

        const temporalRaycaster = new THREE.Raycaster(new THREE.Vector3(0, 1.6, 0), directionUnit)
        let structures = document.querySelectorAll(".structure")
        let array = []

        structures.forEach(structure => array.push(structure.object3D))

        const intersects = temporalRaycaster.intersectObjects(array)
        let intersected = false
        if (angle < .7) {
            if (c < closestSkySpotDistance && c < 10) {
                if (intersects.length > 0) {
                    intersects.forEach(intersect => {
                        if (intersect.distance < c) {
                            intersected = true
                            return
                        }
                    })
                }
                if (!intersected) {
                    closestSkySpotDistance = c
                    closetsSkySpot = spot
                }
            }
        }

    })
    closetsSkySpot != null && closetsSkySpot.click()
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