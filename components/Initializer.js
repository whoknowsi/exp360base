var currentSky

const Init = async () => {
    const results = await fetch("./data/data.json")
    const data = await results.json()

    await AddAssets(data)
    await LoadStructures(data)
    SetFirstSky()
}

Init()

const AddAssets = async (data) => {
    data.skyAssets.forEach(asset => {
        let assetName = asset.split(".")[0].toLowerCase()
        let img = document.createElement("img")
        img.setAttribute("id", assetName)
        img.setAttribute("class", "skyImage")
        img.setAttribute("src", "./img/skies/" + asset)
        document.querySelector("#assets").appendChild(img)
    })
}

const SetFirstSky = () => {
    let sky1 = document.querySelector("#sky")
    let sky2 = document.querySelector("#sky2")
    let structureContainer = document.querySelector("#structure-container")
    let id = currentSky.id.split("-pointer")[0]

    // ESPERAR A QUE LA IMAGEN SE CARGUE ANTES DE PONERLA
    sky1.setAttribute("src", "#" + id)
    sky1.emit("fadein")
    sky2.setAttribute("src", "#" + id)
    sky1.setAttribute("rotation", currentSky.rotation)
    sky2.setAttribute("rotation", currentSky.rotation)
    structureContainer.setAttribute("position", currentSky.position)
}

const LoadStructures = async (data) => {
    CreateSavedElements(data)
}


function CreateSavedElements(data) {
    let skySpots = data.skySpots
    let structures = data.structures
    let infoSpots = data.infoSpots
    let structureContainer = document.querySelector("#structure-container")


    let skySpotsContainer = document.createElement("a-entity")

    skySpots.forEach(spot => {
        skySpotsContainer.appendChild(CreateSkySpot(spot))
    });

    structures.forEach(structure => {
        structureContainer.appendChild(CreateStructure(structure))
    });

    infoSpots.forEach(infoSpot => {

        structureContainer.appendChild(CreateInfoSpot(infoSpot))
    });

    structureContainer.appendChild(skySpotsContainer)

}

function CreateSkySpot(spot) {
    let spotEl = document.createElement("a-entity")
    spotEl.setAttribute("id", spot.id)
    spotEl.classList.add("skyChanger")
    if(spot.current) {
        spotEl.classList.add("current")
        currentSky = {
            id: spot.id,
            rotation: spot.rotation,
            position: (-spot.position.x) + " " + (-spot.position.y + .2/2) + " " + (-spot.position.z),
        }
    }
    spotEl.setAttribute("rotation", "90 0 0")
    spotEl.setAttribute("position", spot.position.x + " " + spot.position.y + " " + spot.position.z)
    spotEl.setAttribute("change-sky", "target: " + spot.target + "; rotation: " + spot.rotation)
    spotEl.setAttribute("geometry", {
        primitive: "circle",
        radius: .2
    })
    spotEl.setAttribute("material", {
        opacity: "0",
        side: "double"
    })

    let spotInnerRing = document.createElement("a-entity")
    spotInnerRing.setAttribute("geometry", {
        primitive: "ring",
        radiusInner: .1825,
        radiusOuter: .13
    })
    spotInnerRing.setAttribute("material", {
        opacity: ".3",
        side: "double",
        shader: "flat"
    })

    spotEl.appendChild(spotInnerRing)

    return spotEl
}

function CreateStructure(structure) {
    let structureContainer = document.createElement("a-entity")
    structureContainer.setAttribute("id", "container-" +  structure.id)
    structureContainer.setAttribute("position", structure.position.x + " " + structure.position.y + " " + structure.position.z)


    let structureEl = document.createElement("a-" + structure.primitive)
    structureEl.setAttribute("id", structure.id)
    structureEl.setAttribute("class", "collidable structure")
    structureEl.setAttribute("width", structure.width)
    structureEl.setAttribute("height", structure.height)
    structureEl.setAttribute("depth", structure.depth)
    structureEl.setAttribute("radius", structure.radius)
    structureEl.setAttribute("color", "#7BC8A4")
    structureEl.setAttribute("opacity", "0")
    structureEl.setAttribute("rotate-corner", "all")
    structureEl.setAttribute("raycaster-listener", "")
    structureContainer.appendChild(structureEl)
    return structureContainer
}

function CreateInfoSpot(infoSpot) {
    let radius = 0.1
    let infoSpotContainer = document.createElement("a-entity")
    infoSpotContainer.setAttribute("id", "container-" + infoSpot.id)

    let line = document.createElement("a-entity")
    line.setAttribute("line", {
        start: infoSpot.startPosition,
        end: infoSpot.endPosition,
        opacity: 0.99,
        color: "white"
    })

    let pointer = document.createElement("a-image")
    pointer.setAttribute("id", infoSpot.id)
    pointer.setAttribute("position", infoSpot.position)
    pointer.setAttribute("geometry", {
        primitive: "circle",
        radius: radius
    })
    pointer.classList.add("infoSpot")
    pointer.setAttribute("material", {
        src: "#infoSpot-img"
    })
    pointer.setAttribute("info-spot", 
        "title: " + infoSpot.infoSpot.title + 
        "; description: " + infoSpot.infoSpot.description +
        "; image: " + infoSpot.infoSpot.image 
    )

    infoSpotContainer.appendChild(line)
    infoSpotContainer.appendChild(pointer)
    return infoSpotContainer
}