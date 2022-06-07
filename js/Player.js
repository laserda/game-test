Player = function(game, canvas) {
    // _this est l'accès à la caméraà l'interieur de Player
    var _this = this;
    _this.angularSensibility = 500;
    // La scène du jeu
    this.scene = game.scene;
    this.engine = game.engine;
    // Si le tir est activée ou non
    this.weponShoot = false;
    this.speed = 0.2;


    // Axe de mouvement X et Z
    this.axisMovement = [false,false,false,false];

    window.addEventListener("mousemove", function(evt) {
        if(_this.rotEngaged === true){
            _this.camera.rotation.y+=evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
                _this.camera.rotation.x+=evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
        }
    }, false);

    
    window.addEventListener("keyup", function(evt) {
        
        switch(evt.keyCode){
            case 90:
            _this.camera.axisMovement[0] = false;
            break;
            case 83:
            _this.camera.axisMovement[1] = false;
            break;
            case 81:
            _this.camera.axisMovement[2] = false;
            break;
            case 68:
            _this.camera.axisMovement[3] = false;
            break;
        }
    }, false);
    
    // Quand les touches sont relachés
    window.addEventListener("keydown", function(evt) {
        switch(evt.keyCode){
            case 90:
            _this.camera.axisMovement[0] = true;
            break;
            case 83:
            _this.camera.axisMovement[1] = true;
            break;
            case 81:
            _this.camera.axisMovement[2] = true;
            break;
            case 68:
            _this.camera.axisMovement[3] = true;
            break;
        }
    }, false);

    // Initialisation de la caméra
    this._initCamera(this.scene, canvas);
    // Le joueur doit cliquer dans la scène pour que controlEnabled soit changé
    this.controlEnabled = false;

    // On lance l'event _initPointerLock pour checker le clic dans la scène
    this._initPointerLock(); 

    // On récupère le canvas de la scène 
    var canvas = this.scene.getEngine().getRenderingCanvas();

    // On affecte le clic et on vérifie qu'il est bien utilisé dans la scène (_this.controlEnabled)
    canvas.addEventListener("mousedown", function(evt) {
        if (_this.controlEnabled && !_this.weponShoot) {
            _this.weponShoot = true;
            _this.handleUserMouseDown();
        }
    }, false);

    // On fait pareil quand l'utilisateur relache le clic de la souris
    canvas.addEventListener("mouseup", function(evt) {
        if (_this.controlEnabled && _this.weponShoot) {
            _this.weponShoot = false;
            _this.handleUserMouseUp();
        }
    }, false);
    
};

Player.prototype = {
    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;
        if(this.camera.axisMovement[0]){
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + (Math.sin(this.camera.rotation.y) * relativeSpeed),
                this.camera.position.y,
                this.camera.position.z + (Math.cos(this.camera.rotation.y) * relativeSpeed)
            );
        }
        if(this.camera.axisMovement[1]){
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + (Math.sin(this.camera.rotation.y) * -relativeSpeed),
                this.camera.position.y,
                this.camera.position.z + (Math.cos(this.camera.rotation.y) * -relativeSpeed)
                );
        }
        if(this.camera.axisMovement[2]){
            this.camera.position = new BABYLON.Vector3(
                this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * relativeSpeed,
                this.camera.position.y,
                this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * relativeSpeed);
        }
        if(this.camera.axisMovement[3]){
            this.camera.position = new BABYLON.Vector3(this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed,
                this.camera.position.y,
                this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed);
        }
    },
    _initPointerLock : function() {
        var _this = this;
        
        // Requete pour la capture du pointeur
        var canvas = this.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);
    
        // Evenement pour changer le paramètre de rotation
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
            } else {
                _this.rotEngaged = true;
            }
        };
        
        // Event pour changer l'état du pointeur, sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },

    _initCamera : function(scene, canvas) {
        // On crée la caméra
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene);
        
        // Axe de mouvement X et Z
        this.camera.axisMovement = [false,false,false,false];
        
        // Si le joueur est en vie ou non
        this.isAlive = true;
        
        // On demande à la caméra de regarder au point zéro de la scène
        this.camera.setTarget(BABYLON.Vector3.Zero());
        
        
        // Appel de la création des armes
        this.camera.weapons = new Weapons(this);

        // Si le joueur est en vie ou non
        this.isAlive = true;

        // // On affecte le mouvement de la caméra au canvas
        // this.camera.attachControl(canvas, true);
    },
    handleUserMouseDown : function() {
        if(this.isAlive === true){
            this.camera.weapons.fire();
        }
    },
    handleUserMouseUp : function() {
        if(this.isAlive === true){
            this.camera.weapons.stopFire();
        }
    },
};