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
                ChangeSky(evt)
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
    SetMoving()

    let geometriesContainer = document.querySelector("#geometriesContainer")
    let geometriesContainerPos = geometriesContainer.object3D.position
    let geometriesContainerTarget = new THREE.Vector3(geometriesContainerPos.x, geometriesContainerPos.y, geometriesContainerPos.z)
    let spotPositon = new THREE.Vector3()
    el.object3D.getWorldPosition(spotPositon)

    geometriesContainerTarget.add(spotPositon.negate())
    
    geometriesContainer.components.animation__move.data.to = geometriesContainerTarget.x + " " + geometriesContainerTarget.y + " " + geometriesContainerTarget.z
    geometriesContainer.components.animation__move.data.from = geometriesContainerPos.x + " " + geometriesContainerPos.y + " " + geometriesContainerPos.z
    geometriesContainer.emit("move")


    let skyTarget = new THREE.Vector3(spotPositon.x*12.5, spotPositon.y*12.5, spotPositon.z*12.5)
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

    setTimeout(() => {

        let img = document.createElement("img")
        img.onload = () => {
            sky1.setAttribute("src", "./img/skies/1664/" + data.target + ".jpg")
            sky2.setAttribute("src", "./img/skies/1664/" + data.target + ".jpg")
            UnsetMoving()
        }
        img.onerror = () => { }
        img.src = "./img/skies/1664/" + data.target + ".jpg"
        sky2.setAttribute("rotation", data.rotation)
        
    }, 1001);


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

const PreloadCloseSkies = (data) => {
    let skies = JSON.parse(sessionStorage.getItem('skies'))
    let skiesToPreload = []
    let currentPosition = skies.filter(sky => sky.target == data.target)[0].position

    skies.forEach(sky => {
        let currentVectorPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
        let skyVectorPosition = new THREE.Vector3(sky.position.x, sky.position.y, sky.position.z)
        let distance = currentVectorPosition.distanceTo(skyVectorPosition)

        if (distance < 10 && !sky.loaded) skiesToPreload.push(sky)
    })


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
            if (skiesToPreload.map(sky => sky.target).includes(sky.target)) {
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

