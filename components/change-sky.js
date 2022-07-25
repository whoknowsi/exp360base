let allSkies

AFRAME.registerComponent('change-sky', {
    schema: {
        target: {
            type: 'string'
        },
        rotation: {
            type: 'string'
        }
    },
    init: function () {
        let data = this.data;
        let el = this.el;


        el.addEventListener('click', () => ChangeSky(el, data))
        el.addEventListener('raycaster-intersected',  () => {
            if (device == "mobile" || device == "tablet") {
                ChangeSky(el, data)
            }
            el.firstChild.setAttribute("material", "opacity", .6)
        })
        el.addEventListener('raycaster-intersected-cleared', () => {
            el.firstChild.setAttribute("material", "opacity", .3)
        })
    }
})

function ChangeSky(el, data) {
    if (IsMoving()) { return }

    let targetIsCurrentSky = el.classList.contains("current")
    if(targetIsCurrentSky) { return }
    SetMoving()

    let currentSky = document.querySelector(".current")
    currentSky.classList.remove("current")

    el.classList.add("current")

    let geometriesContainer = document.querySelector("#geometriesContainer")
    let skySpots = document.querySelectorAll(".skySpot")
    let hotSpots = document.querySelectorAll(".hotSpot")
    let geometriesContainerPos = geometriesContainer.object3D.position
    let geometriesContainerTarget = new THREE.Vector3(geometriesContainerPos.x, geometriesContainerPos.y, geometriesContainerPos.z)
    let spotPositon = new THREE.Vector3()
    el.object3D.getWorldPosition(spotPositon)
    let imgLoaded = false
    let animationEnded = false

    geometriesContainerTarget.add(spotPositon.negate())
    
    geometriesContainer.components.animation__move.data.to = geometriesContainerTarget.x + " " + geometriesContainerTarget.y + " " + geometriesContainerTarget.z
    geometriesContainer.components.animation__move.data.from = geometriesContainerPos.x + " " + geometriesContainerPos.y + " " + geometriesContainerPos.z
    geometriesContainer.emit("move")

    skySpots.forEach(skySpot => {
        skySpot.firstChild.components.animation__fade.data.to = 0
        skySpot.firstChild.components.animation__fade.data.from = .3
        skySpot.firstChild.components.animation__fade.data.easing = "easeOutExpo"
        skySpot.firstChild.emit("fade")

        function onAnimationFadeFinish(evt) {
            if (evt.detail.name === "animation__fade") {
                skySpot.firstChild.components.animation__fade.data.to = .3
                skySpot.firstChild.components.animation__fade.data.from = 0
                skySpot.firstChild.components.animation__fade.data.easing = "easeInExpo"
                skySpot.firstChild.emit("fade")
                skySpot.firstChild.removeEventListener("animationcomplete", onAnimationFadeFinish)
            }
        }
        skySpot.firstChild.addEventListener("animationcomplete", onAnimationFadeFinish)
    })

    hotSpots.forEach(hotSpot => {
        Array.from(hotSpot.children).forEach(child => {
            child.components.animation__fade.data.to = 0
            child.components.animation__fade.data.from = 1
            child.components.animation__fade.data.easing = "easeOutExpo"
            child.emit("fade")

            function onAnimationFadeFinishPointer(evt) {
                if (evt.detail.name === "animation__fade") {
                    child.components.animation__fade.data.to = 1
                    child.components.animation__fade.data.from = 0
                    child.components.animation__fade.data.easing = "easeInExpo"
                    child.emit("fade")
                    child.removeEventListener("animationcomplete", onAnimationFadeFinishPointer)
                }
            }
            child.addEventListener("animationcomplete", onAnimationFadeFinishPointer)
        })
        
        hotSpot.previousSibling.components.animation__fade.data.to = 0
        hotSpot.previousSibling.components.animation__fade.data.from = .99
        hotSpot.previousSibling.components.animation__fade.data.easing = "easeOutExpo"
        hotSpot.previousSibling.emit("fade")

        function onAnimationFadeFinishLine(evt) {
            if (evt.detail.name === "animation__fade") {
                hotSpot.previousSibling.components.animation__fade.data.to = .99
                hotSpot.previousSibling.components.animation__fade.data.from = 0
                hotSpot.previousSibling.components.animation__fade.data.easing = "easeInExpo"
                hotSpot.previousSibling.emit("fade")
                hotSpot.previousSibling.removeEventListener("animationcomplete", onAnimationFadeFinishLine)
            }
        }
        hotSpot.previousSibling.addEventListener("animationcomplete", onAnimationFadeFinishLine)
    })


    let skyTarget = new THREE.Vector3(spotPositon.x*12.5, spotPositon.y*12.5, spotPositon.z*12.5)

    if(skyTarget.x > maxTraslationSky) skyTarget.x = maxTraslationSky
    if(skyTarget.y > maxTraslationSky) skyTarget.y = maxTraslationSky 
    if(skyTarget.z > maxTraslationSky) skyTarget.z = maxTraslationSky 

    if(skyTarget.x < -maxTraslationSky) skyTarget.x = -maxTraslationSky
    if(skyTarget.y < -maxTraslationSky) skyTarget.y = -maxTraslationSky 
    if(skyTarget.z < -maxTraslationSky) skyTarget.z = -maxTraslationSky 

    let sky2 = document.querySelector("#sky2")
    sky2.components.animation__move.data.to = skyTarget.x + " " + skyTarget.y + " " + skyTarget.z
    sky2.components.animation__move.data.from = "0 0 0"
    sky2.emit("move")
    sky2.emit("fade")

    let sky1 = document.querySelector("#sky1")
    sky1.components.animation__move.data.from = (-skyTarget.x) + " " + (-skyTarget.y) + " " + (-skyTarget.z)
    sky1.components.animation__move.data.to = "0 0 0"
    sky1.emit("move")

    sky1.setAttribute("src", "#" + data.target)
    sky1.setAttribute("rotation", data.rotation)

    let img = document.createElement("img")
    img.onload = () => {
        imgLoaded = true
        THREE.Cache.add("./img/skies/1664/" +  data.target + ".jpg", img)

        if(animationEnded) { UnsetMoving() } 
    } 
    img.src = "./img/skies/1664/" +  data.target + ".jpg"

    function onAnimationMoveFinish(evt) {
        if (evt.detail.name === "animation__move") {
            animationEnded = true
            sky1.setAttribute("src", "./img/skies/1664/" +  data.target + ".jpg")
            sky2.setAttribute("src", "./img/skies/1664/" +  data.target + ".jpg")
            sky2.setAttribute("rotation", data.rotation)
            sky2.removeEventListener("animationcomplete", onAnimationMoveFinish)

            if(imgLoaded) { UnsetMoving() }
        }
    }

    sky2.addEventListener("animationcomplete", onAnimationMoveFinish)
}

function SetMoving() {
    let structureContainer = document.querySelector("#geometriesContainer")
    structureContainer.classList.add("moving")
}
function UnsetMoving() {
    let structureContainer = document.querySelector("#geometriesContainer")
    structureContainer.classList.remove("moving")
}
function IsMoving() {
    let structureContainer = document.querySelector("#geometriesContainer")
    return structureContainer.classList.contains("moving")
}