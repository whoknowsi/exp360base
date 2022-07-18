import { Height } from "./GlobalConfig.js"
import { MapInterval, NormalizeAngleInRadians } from "./helper.js"
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
let structureContainerPosition = document.querySelector("#structure-container").getAttribute("position")

export function ShowPanelInfo(target, intersection, title, description, image) {

    let existPanel = document.querySelector(".infoPanel")
    if(existPanel != null) existPanel.remove()

    let targetPosition = target.getAttribute("position") 
    point = {
        x: targetPosition.x + structureContainerPosition.x,
        y: targetPosition.y + structureContainerPosition.y,
        z: targetPosition.z + structureContainerPosition.z
    }
    
    let atan = point.z/point.x
    angleBetweenXandZ = Math.atan(atan)

    if(point.z < 0 && point.x > 0) relativeAngle = - angleBetweenXandZ
    if(point.z < 0 && point.x < 0) relativeAngle = Math.PI - angleBetweenXandZ
    if(point.z > 0 && point.x < 0) relativeAngle = Math.PI - angleBetweenXandZ
    if(point.z > 0 && point.x > 0) relativeAngle = (Math.PI*2 - angleBetweenXandZ)


    angleBetweenHorizontalAndY = Math.acos((Math.sqrt(point.z*point.z + point.x*point.x))/intersection.distance)
    if(target.getAttribute("position").y >= Height) angleBetweenHorizontalAndY = -angleBetweenHorizontalAndY

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
    MovePanel(target)
    document.addEventListener("mousemove", () => MovePanel(target))
    document.addEventListener("touchmove", () => MovePanel(target))
}

var MovePanel = function(target) {
    console.log("test")
    let transform = toScreenPosition(target)
    panel.style.transform = `translate(${transform.x}px, ${transform.y}px)`
}

export function HidePanelInfo() {
    document.removeEventListener("mousemove", MovePanel)
    panel != null && panel.remove()
}

function toScreenPosition(obj)
{
    let camera = document.querySelector("#camera").components.camera.camera
    let canvas = document.querySelector(".a-canvas")

    var vector = new THREE.Vector3()

    var widthHalf = 0.5*window.innerWidth
    var heightHalf = 0.5*window.innerHeight

    obj.updateMatrixWorld()
    vector.setFromMatrixPosition(obj.matrixWorld)
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf
    vector.y = - ( vector.y * heightHalf ) + heightHalf

    return { 
        x: vector.x,
        y: vector.y
    }
}







