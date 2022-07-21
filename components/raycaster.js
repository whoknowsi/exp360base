let intersectingStructure

AFRAME.registerComponent('raycaster-element', {
    dependencies: ['raycaster'],

    init: function () {
        this.camera = document.querySelector("a-camera").components.camera.camera
        this.cursor = document.querySelector("#cursor")

        // this.el.addEventListener('raycaster-intersection', function (evt) {
        //     intersectingStructure = Array.from(evt.detail.els).reduce(function(prev, current) {
        //         return (prev.y < current.y) ? prev : current
        //     }).object3D
        // })
    },
    tick: function() {
        if(intersectingStructure == null) { return }

        temporalRaycaster.setFromCamera(pointer, this.camera)
        let intersection = temporalRaycaster.intersectObject(intersectingStructure)

        if(intersection.length == 0) { return }

        intersection = intersection[0]
        

        this.cursor.setAttribute("position", intersection.point.x + " " + intersection.point.y + " " + intersection.point.z)
        this.cursor.setAttribute("rotation", (90 * intersection.face.normal.y) + " " + (90 * intersection.face.normal.x) + " " + (90 * intersection.face.normal.z))
    }
})