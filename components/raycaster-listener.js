var startCamRotation

AFRAME.registerComponent('raycaster-listener', {
    init: function () {
        this.cornerValue = 0.1
        this.cursor = document.querySelector("#cursor")
        this.el.addEventListener('raycaster-intersected', evt => {
            this.raycaster = evt.detail.el;
            //AddTarget(this.el);
        })
        this.el.addEventListener('raycaster-intersected-cleared', evt => {
            //this.cursor.setAttribute("visible", "false")
            this.raycaster = null;
            //RemoveTarget(this.el);
        })
        
        
    },
    tick: function () {

        if(device == "mobile" || device == "tablet") { return }
        if(this.raycaster == null) { return }
        

        let intersection = this.raycaster.components.raycaster.getIntersection(GetCurrentTarget())
        if(intersection == null) { return }

        // // CursorManagment(hotspotIntersections[0], null, 1)
        CursorManagment(intersection, this.cursor)
    }
})
