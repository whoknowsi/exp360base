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

function ShowPanelInfo(target, intersection, title, description, image) {

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
    MovePanel(target)
    document.addEventListener("mousemove", () => MovePanel(target))
    document.addEventListener("touchmove", () => MovePanel(target))
}

var MovePanel = function(target) {
    let transform = toScreenPosition(target)
    panel.style.transform = `translate(${transform.x}px, ${transform.y}px)`
}

function HidePanelInfo() {
    document.removeEventListener("mousemove", MovePanel)
    panel != null && panel.remove()
}

function toScreenPosition(obj)
{
    let camera = document.querySelector("a-camera").components.camera.camera
    let canvas = document.querySelector("a-canvas")

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







