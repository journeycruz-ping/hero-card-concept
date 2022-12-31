import "./style.css";
import {
    BoxGeometry,
    Vector3,
    Scene,
    WebGLRenderer,
    OrthographicCamera,
    DirectionalLight,
    Object3D,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    PerspectiveCamera
} from "three";
import Flickity from "flickity";

{
    let body,
        mainContainer,
        scene,
        renderer,
        camera,
        cameraLookAt = new Vector3(-50, 75, 10),
        cameraTarget = new Vector3(0, 0, 800),
        windowWidth,
        windowHeight,
        windowHalfWidth,
        windowHalfHeight,
        mouseX = 0,
        mouseY = 0,
        contentElement,
        colors = ["#b3282d", "#992226", "#801c20", "#d6311b", "#d84332"],
        graphics,
        currentGraphic = 0,
        graphicCanvas,
        gctx,
        canvasWidth = 270,
        canvasHeight = 270,
        graphicPixels,
        particles = [],
        graphicOffsetX = canvasWidth / 2,
        graphicOffsetY = canvasHeight / 2;

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
        scene = new Scene();

        renderer = new WebGLRenderer({
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
    const initCamera = (left, right, top, bottom, near, far) => {
        camera = new OrthographicCamera(
            left,
            right,
            top,
            bottom,
            near,
            far
        );

        camera.position.z = 800;
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
        const shadowLight = new DirectionalLight(0xffffff, 2);
        shadowLight.position.set(20, 0, 10);
        scene.add(shadowLight);

        const light = new DirectionalLight(0xffffff, 1.5);
        light.position.set(-20, 0, 20);
        scene.add(light);

        const backLight = new DirectionalLight(0xffffff, 1);
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
        try {
            const particle = new Object3D();
            const geometryCore = new SphereGeometry(4.25, 4.25, 4.25);
            const materialCore = new MeshBasicMaterial({
                color: colors[i % colors.length],
            });

            const box = new Mesh(geometryCore, materialCore);
            box.geometry.__dirtyVertices = true;
            box.geometry.dynamic = true;

            const pos = getGraphicPos(graphicPixels[i]);
            particle.targetPosition = new Vector3(pos.x, pos.y, pos.z);

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
        } catch (err) {
            throw new Error(error);
        }
    };

    Particle.prototype.updateRotation = function() {
        this.particle.rotation.x += this.vx;
        this.particle.rotation.y += this.vy;
    };

    Particle.prototype.updatePosition = function() {
        this.particle.position.lerp(this.particle.targetPosition, 0.1);
    };

    function updateParticles() {
        for (var i = 0, l = particles.length; i < l; i++) {
            particles[i].updateRotation();
            particles[i].updatePosition();
        }
    }

    const getGraphicPos = (pixel) => {
        try {
            const posX = (pixel.x - graphicOffsetX - Math.random() * 4 - 2) * 3;
            const posY = (pixel.y - graphicOffsetY - Math.random() * 4 - 2) * 3;
            const posZ = -20 * Math.random() + 40;

            return { x: posX, y: posY, z: posZ };
        } catch (error) {
            throw new Error(error);
        }

    };

    const setParticles = () => {
        try {
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
        } catch (err) {
            throw new Error(err);
        }
    };

    // -----------------------
    // Random position
    // -----------------------

    function randomPos(vector, outFrame = false) {
        const radius = outFrame ? (windowWidth * 2) : (windowWidth * -2);
        const centerX = 0;
        const centerY = 0;

        // ensure that p(r) ~ r instead of p(r) ~ constant
        const r = 750
        const angle = Math.random() * Math.PI * 2;

        // compute desired coordinates
        vector.x = centerX + r * Math.cos(angle);
        vector.y = centerY + r * Math.sin(angle);
        vector.z = Math.random() * windowWidth;
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
        const geometry = new BoxGeometry(12, 12, 12);
        const material = new MeshBasicMaterial({ color: 0xdddddd });
        const cube = new Mesh(geometry, material);
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


    const onMouseMove = (event) => {
        mouseX = event.clientX - windowHalfWidth;
        mouseY = event.clientY - windowHalfHeight;
        cameraTarget.x = (mouseX * -1) / 20;
        cameraTarget.y = mouseY / 20;
    };

    const onWindowResize = () => {
        setWindowSize();

        resize();

        // camera.updateProjectionMatrix();
        renderer.setSize(windowWidth, windowHeight);
    };

    const setWindowSize = () => {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        windowHalfWidth = windowWidth / 2;
        windowHalfHeight = windowHeight / 2;
    };

    const resize = () => {
        if (windowWidth <= 1025) {
            const fieldOfView = 75;
            const aspectRatio = windowWidth / windowHeight;
            const nearPlane = 1;
            const farPlane = 3000;
            camera = new PerspectiveCamera(
                fieldOfView,
                aspectRatio,
                nearPlane,
                farPlane);
            camera.position.z = 800;
            camera.aspect = windowWidth / windowHeight;
        }
        if (windowWidth >= 1026 && windowWidth <= 1269) {
            initCamera(windowWidth / -0.6, windowWidth / 2.2, 944 / 1.5, 944 / -1, 0.01, 5000);
        }
        if (windowWidth >= 1270 && windowWidth <= 1389) {
            initCamera(windowWidth / -0.9, windowWidth / 2.7, 944 / 2.2, 944 / -1.5, 0.01, 5000);
        }
        if (windowWidth >= 1390 && windowWidth <= 1477) {
            initCamera(windowWidth / -1, windowWidth / 2.5, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 1478 && windowWidth <= 1604) {
            initCamera(windowWidth / -1.2, windowWidth / 1.8, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 1605 && windowWidth <= 1771) {
            initCamera(windowWidth / -1.2, windowWidth / 1.7, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 1772 && windowWidth <= 1892) {
            initCamera(windowWidth / -1.4, windowWidth / 1.7, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 1893 && windowWidth <= 2127) {
            initCamera(windowWidth / -1.6, windowWidth / 1.5, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 2128 && windowWidth <= 2356) {
            initCamera(windowWidth / -1.8, windowWidth / 1.4, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 2357 && windowWidth <= 2549) {
            initCamera(windowWidth / -2, windowWidth / 1.3, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
        if (windowWidth >= 2550) {
            initCamera(windowWidth * -.4762, 2048, 944 / 2.4, 944 / -1.6, 0.01, 5000);
        }
    }

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

    setInterval(function() { document.querySelector(".next").click(); }, 4000);

    try {
        document.addEventListener("DOMContentLoaded", function() {
            resize();
        })
    } catch (error) {
        throw new Error(error)
    }

    initStage();
    initScene();
    initCanvas();
    initLights();
    initSlider();
    initBgObjects();
    updateGraphic();
    animate();
}