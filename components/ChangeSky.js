let allSkies

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
        let sky1 = document.querySelector("#sky")
        let sky2 = document.querySelector("#sky2")
        let radiusSkyProportion = sky1.getAttribute("radius") / 8
        el.addEventListener('click', evt => {
            if (evt.path[2].getAttribute("id").includes("structure") || evt.detail.cursorEl.getAttribute("id") == "cursor-prev-raycast")
                ChangeSky(data, el, sky1, sky2, radiusSkyProportion)
        })
        el.addEventListener('raycaster-intersected', evt => {
            if (device == "mobile" || device == "tablet") {
                ChangeSky(data, el, sky1, sky2, radiusSkyProportion)
            }
            el.firstChild.setAttribute("material", "opacity", .6)
        })
        el.addEventListener('raycaster-intersected-cleared', evt => {
            el.firstChild.setAttribute("material", "opacity", .3)
        })
    }
})

function ChangeSky(data, el, sky1, sky2, radiusSkyProportion) {
    let structureContainer = document.querySelector("#structure-container")
    let structureContainerPosition = structureContainer.getAttribute("position")
    let currentPoint = document.querySelector(".current")
    let startPoint = new THREE.Vector3(structureContainerPosition.x, structureContainerPosition.y, structureContainerPosition.z)
    let targetPoint = el.object3D.position
    let heightTarget = .2
    let position = new THREE.Vector3(startPoint.x + targetPoint.x, startPoint.y + targetPoint.y, startPoint.z + targetPoint.z)
    if (IsMoving()) { return }
    if (sky1.getAttribute("src") == data.target || sky2.getAttribute("src") == data.target) { return }

    let targetSkyPosition = new THREE.Vector3(position.x * radiusSkyProportion, position.y * radiusSkyProportion, position.z * radiusSkyProportion)
    let endPoint = new THREE.Vector3(startPoint.x - position.x, (startPoint.y - position.y) + heightTarget / 2, startPoint.z - position.z)
    if (targetSkyPosition.x < 0.000001 && targetSkyPosition.x > -0.000001) targetSkyPosition.x = 0
    if (targetSkyPosition.y < 0.000001 && targetSkyPosition.y > -0.000001) targetSkyPosition.y = 0
    if (targetSkyPosition.z < 0.000001 && targetSkyPosition.z > -0.000001) targetSkyPosition.z = 0
    if (endPoint.x < 0.000001 && endPoint.x > -0.000001) endPoint.x = 0
    if (endPoint.y < 0.000001 && endPoint.y > -0.000001) endPoint.y = 0
    if (endPoint.z < 0.000001 && endPoint.z > -0.000001) endPoint.z = 0
    structureContainer.components.animation__moveout.data.to = endPoint.x + " " + endPoint.y + " " + endPoint.z
    structureContainer.components.animation__moveout.data.from = startPoint.x + " " + startPoint.y + " " + startPoint.z
    structureContainer.emit("moveout")

    const loader = new THREE.TextureLoader();
    loader.load("./img/skies/" + data.target + ".jpg", (texture) => {
        if (currentPoint == null) currentPoint = el

        currentPoint.classList.remove("current")
        el.classList.add("current")
    
        sky2.setAttribute("material", "src", "#" + data.target)
        sky2.object3D.children[0].material.map = texture
        sky2.object3D.children[0].material.needsUpdate = true;

        structureContainer.setAttribute("position", endPoint)
        SetMoving()
        MakeTransitionBetweenSkies(data, targetSkyPosition, texture)

    })
}
function MakeTransitionBetweenSkies(data, targetSkyPosition, texture) {
    let sky1 = document.querySelector("#sky")
    let sky2 = document.querySelector("#sky2")

    sky2.components.animation__movein.data.from = targetSkyPosition.x + " " + targetSkyPosition.y + " " + targetSkyPosition.z
    sky2.emit("movein")
    sky1.emit("fadeout")

    if (data.rotation != "") {
        sky2.setAttribute("rotation", data.rotation)
    } else {
        sky2.setAttribute("rotation", "0 0 0")
    }

    setTimeout(() => {
        if (data.rotation != "") {
            sky1.setAttribute("rotation", data.rotation)
        } else {
            sky1.setAttribute("rotation", "0 0 0")
        }

        sky1.setAttribute("material", "src", "#" + data.target)
        sky1.object3D.children[0].material.map = texture
        sky1.object3D.children[0].material.opacity = 1

        sky1.object3D.children[0].material.needsUpdate = true;
        sky1.setAttribute("position", "0 0 0")

        PreloadCloseSkies(data)

        UnsetMoving()
    }, 600)

}

function SetMoving() {
    let structureContainer = document.querySelector("#structure-container")
    structureContainer.classList.add("moving")
}
function UnsetMoving() {
    let structureContainer = document.querySelector("#structure-container")
    structureContainer.classList.remove("moving")
}
function IsMoving() {
    let structureContainer = document.querySelector("#structure-container")
    return structureContainer.classList.contains("moving")
}

let InitAFrameSky = () => {
    let skySpots = document.querySelectorAll(".skyChanger")
    skySpots.forEach(spot => {
        spot.setAttribute("change-sky", "")
    })
}

InitAFrameSky()

const PreloadCloseSkies = (data) => {
    let skies = JSON.parse(sessionStorage.getItem('skies'))
    let skiesToPreload = []
    let currentPosition = skies.filter(sky => sky.target == data.target)[0].position

    skies.forEach(sky => {
        let currentVectorPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
        let skyVectorPosition = new THREE.Vector3(sky.position.x, sky.position.y, sky.position.z)
        let distance = currentVectorPosition.distanceTo(skyVectorPosition)

        if(distance < 10 && !sky.loaded) skiesToPreload.push(sky)     
    })

    console.log(skiesToPreload)

    let interval = 200
    let promise = Promise.resolve();
    skiesToPreload.forEach(sky => {
        promise = promise.then(function () {
            PreloadSky(sky)
            return new Promise(function (resolve) {
                setTimeout(resolve, interval);
            })
        })
    })

    promise.then(function () {
        sessionStorage.setItem('skies', "[" + skies.map((sky) => {
            let skyObj = sky
            if(skiesToPreload.map(sky => sky.target).includes(sky.target)) {
                console.log("here")
                skyObj = {
                    target: sky.target,
                    position: sky.position,
                    loaded: true
                }
            }
            return JSON.stringify(skyObj)
        }) + "]")
    });
}

const PreloadSky = (sky) => {
    let sky2 = document.querySelector("#sky2")
    sky2.setAttribute("src", "#" + sky.target)
}

