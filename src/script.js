import "./style.css";
import * as THREE from "three";
import * as Flickity from "flickity";

{
    let body,
        mainContainer,
        scene,
        renderer,
        camera,
        cameraLookAt = new THREE.Vector3(-50, 75, 10),
        cameraTarget = new THREE.Vector3(0, 0, 800),
        windowWidth,
        windowHeight,
        windowHalfWidth,
        windowHalfHeight,
        points,
        mouseX = 0,
        mouseY = 0,
        gui,
        stats,
        contentElement,
        colors = ["#b3282d", "#992226", "#801c20", "#d6311b", "#d84332"],
        graphics,
        currentGraphic = 0,
        graphicCanvas,
        gctx,
        canvasWidth = 240,
        canvasHeight = 240,
        graphicPixels,
        particles = [],
        graphicOffsetX = canvasWidth / 2,
        graphicOffsetY = canvasHeight / 2,
        frustumSize = 5;

    // -----------------------
    // Setup stage
    // -----------------------
    const initStage = () => {
        body = document.querySelector("body");
        mainContainer = document.querySelector("#main");
        contentElement = document.querySelector(".intro-content");

        setWindowSize();
        window.addEventListener("resize", onWindowResize, false);
        window.addEventListener("mousemove", onMouseMove, false);
    };

    // -----------------------
    // Setup scene
    // -----------------------
    const initScene = () => {
        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(windowWidth, windowHeight);
        mainContainer.appendChild(renderer.domElement);
    };

    // -----------------------
    // Setup camera
    // -----------------------
    const initCamera = () => {
        camera = new THREE.OrthographicCamera(
            windowWidth / -2.05, // left
            windowWidth / 1.15, // right
            windowHeight / 2, // top
            windowHeight / -2, //bottom make 0
            0.01, // near
            5000 // far
        );

        camera.position.z = 800;
        camera.position.x += -1000;
    };

    // -----------------------
    // Setup canvas
    // -----------------------
    const initCanvas = () => {
        graphicCanvas = document.createElement("canvas");
        graphicCanvas.width = canvasWidth;
        graphicCanvas.height = canvasHeight;
        gctx = graphicCanvas.getContext("2d");
        graphics = document.querySelectorAll(".intro-cell > img");
    };

    // -----------------------
    // Setup light
    // -----------------------
    const initLights = () => {
        const shadowLight = new THREE.DirectionalLight(0xffffff, 2);
        shadowLight.position.set(20, 0, 10);
        scene.add(shadowLight);

        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(-20, 0, 20);
        scene.add(light);

        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(0, 0, -20);
        scene.add(backLight);
    };

    // -----------------------
    // Setup particles
    // -----------------------

    function Particle() {
        this.vx = Math.random() * 0.05;
        this.vy = Math.random() * 0.05;
    }

    Particle.prototype.init = function(i) {
        const particle = new THREE.Object3D();
        const geometryCore = new THREE.SphereGeometry(4, 4, 4);
        const materialCore = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
        });

        const box = new THREE.Mesh(geometryCore, materialCore);
        box.geometry.__dirtyVertices = true;
        box.geometry.dynamic = false;

        const pos = getGraphicPos(graphicPixels[i]);
        particle.targetPosition = new THREE.Vector3(pos.x, pos.y, pos.z);

        particle.position.set(
            windowWidth * 0.5,
            windowHeight * 0.5, -10 * Math.random() + 20
        );
        randomPos(particle.position);

        // for (var i = 0; i < box.geometry.vertices.length; i++) {
        //     box.geometry.vertices[i].x += -2 + Math.random() * 4;
        //     box.geometry.vertices[i].y += -2 + Math.random() * 4;
        //     box.geometry.vertices[i].z += -2 + Math.random() * 4;
        // }
        particle.add(box);
        this.particle = particle;
    };

    Particle.prototype.updateRotation = function() {
        this.particle.rotation.x += this.vx;
        this.particle.rotation.y += this.vy;
    };

    Particle.prototype.updatePosition = function() {
        this.particle.position.lerp(this.particle.targetPosition, 0.13);
    };

    function updateParticles() {
        for (var i = 0, l = particles.length; i < l; i++) {
            particles[i].updateRotation();
            particles[i].updatePosition();
        }
    }

    const getGraphicPos = (pixel) => {
        const posX = (pixel.x - graphicOffsetX - Math.random() * 4 - 2) * 3;
        const posY = (pixel.y - graphicOffsetY - Math.random() * 4 - 2) * 3;
        const posZ = -20 * Math.random() + 40;

        return { x: posX, y: posY, z: posZ };
    };

    const setParticles = () => {
        for (let i = 0; i < graphicPixels.length; i++) {
            if (particles[i]) {
                const pos = getGraphicPos(graphicPixels[i]);
                particles[i].particle.targetPosition.x = pos.x;
                particles[i].particle.targetPosition.y = pos.y;
                particles[i].particle.targetPosition.z = pos.z;
            } else {
                const p = new Particle();
                p.init(i);
                scene.add(p.particle);
                particles[i] = p;
            }
        }

        for (let i = graphicPixels.length; i < particles.length; i++) {
            randomPos(particles[i].particle.targetPosition, true);
        }
    };

    // -----------------------
    // Random position
    // -----------------------

    function randomPos(vector, outFrame = false) {
        const radius = outFrame ? windowWidth * 5 : windowWidth * -5;
        const centerX = 0;
        const centerY = 0;

        // ensure that p(r) ~ r instead of p(r) ~ constant
        const r = 550;
        const angle = Math.random() * Math.PI * 2;

        // compute desired coordinates
        vector.x = centerX + r * Math.cos(angle);
        vector.y = centerY + r * Math.sin(angle);
        vector.z = Math.random() * 0.5;
    }

    // -----------------------
    // Update canvas
    // -----------------------

    const updateGraphic = () => {
        const img = graphics[currentGraphic];
        gctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        const gData = gctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
        graphicPixels = [];

        for (let i = gData.length; i >= 0; i -= 4) {
            if (gData[i] == 0) {
                const x = (i / 4) % canvasWidth;
                const y = canvasHeight - Math.floor(Math.floor(i / canvasWidth) / 4);

                if (x && x % 2 == 0 && y && y % 2 == 0) {
                    graphicPixels.push({
                        x: x,
                        y: y,
                    });
                }
            }
        }

        for (let i = 0; i < particles.length; i++) {
            randomPos(particles[i].particle.targetPosition);
        }

        setTimeout(() => {
            setParticles();
        }, 500);
    };

    // -----------------------
    // Setup background objects
    // -----------------------

    const initBgObjects = () => {
        for (let i = 0; i < 40; i++) {
            createBgObject(i);
        }
    };

    const createBgObject = (i) => {
        // const geometry = new THREE.SphereGeometry(10, 6, 6);
        // const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        // const sphere = new THREE.Mesh(geometry, material);
        // scene.add(sphere);
        const geometry = new THREE.BoxGeometry(12, 12, 12);
        const material = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        const x = Math.random() * windowWidth * 2 - windowWidth;
        const y = Math.random() * windowHeight * 2 - windowHeight;
        const z = Math.random() * -2000 - 200;
        cube.position.set(x, y, z);
    };

    // -----------------------
    // Setup slider
    // -----------------------

    const initSlider = () => {
        const elem = document.querySelector(".intro-carousel");

        const flkty = new Flickity(elem, {
            // options
            cellAlign: "center",
            pageDots: false,
            wrapAround: true,
            resize: true,
        });

        function listener() {
            currentGraphic = flkty.selectedIndex;
            updateGraphic();
        }

        flkty.on("select", listener);
    };

    // setInterval(function() { document.querySelector(".next").click() }, 2000);

    const onMouseMove = (event) => {
        mouseX = event.clientX - windowHalfWidth;
        mouseY = event.clientY - windowHalfHeight;
        cameraTarget.x = (mouseX * -1) / 20;
        cameraTarget.y = mouseY / 20;
    };

    const onWindowResize = () => {
        setWindowSize();
        if (windowWidth <= 900) {
            const fieldOfView = 75;
            const aspectRatio = windowWidth / windowHeight;
            const nearPlane = 1;
            const farPlane = 3000;
            camera = new THREE.PerspectiveCamera(
                fieldOfView,
                aspectRatio,
                nearPlane,
                farPlane);
            camera.position.z = 800;
            camera.aspect = windowWidth / windowHeight;
        } else {
            initCamera();
        }
        // camera.updateProjectionMatrix();
        renderer.setSize(windowWidth, windowHeight);
    };

    const setWindowSize = () => {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        windowHalfWidth = windowWidth / 2;
        windowHalfHeight = windowHeight / 2;
    };

    const animate = () => {
        requestAnimationFrame(animate);
        updateParticles();
        camera.position.lerp(cameraTarget, 0.2);
        camera.lookAt(cameraLookAt);
        render();
    };

    const render = () => {
        renderer.setClearColor(0x000000, 0); // the default
        renderer.render(scene, camera);
    };

    setInterval(function() {
        document.querySelector(".next").click();
    }, 8000);

    initStage();
    initScene();
    initCanvas();
    initLights();
    initCamera();
    initSlider();
    initBgObjects();
    updateGraphic();
    animate();
}