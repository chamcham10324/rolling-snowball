
document.addEventListener('DOMContentLoaded', exec); // body が読み込み終わるまで待つ

var count = 0;
var width = 960 //* 1.5; 
var height = 600 //* 1.5;
var side = 10;
var border = 500;
var scene;
var camera;
var mesh;
var renderer;
var dir_light;
var amb_light;
var isMouseclick = false;
var shiftx = 0;
var shifty = 0;
var snowman;
var tree;
var leftwall;
var rightwall;
var speed = 0.1;
var snowradius;     // 雪玉の半径
var roadwidth;      // 雪玉にとっての道幅
var distance;       // 雪玉と木の幹の距離
var score = 0;      // ジャンプしてクリアした回数
var isEnd = false;  // ゲームオーバーになったかどうかのフラグ
var isCheck = true; // 木が雪だるまより手前に来たかどうかのフラグ
function exec() {
    // キーボタンを押したとき
    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'a':
                shiftx = -1.5;
                break;
            case 'd':
                shiftx = 1.5;
                break;
        }
    });

    // キーを放したとき
    document.addEventListener('keyup', function (e) {
        switch (e.key) {
            case 'a':
                shiftx = 0;
                break;
            case 'd':
                shiftx = 0;
                break;
        }
    });

    // カウントアップ機能 functionの処理を1000ミリ秒ごとに繰り返す
    const countup = setInterval(function () {
        if (isCheck) { count++; }
    }, 1000);

    // シーンを作る
    scene = new THREE.Scene();

    // ライトの設定
    dir_light = new THREE.DirectionalLight(0xFFFFFF, 0.35);
    scene.add(dir_light);

    var amb_light = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(amb_light);

    // 雪だるまを作る関数を呼ぶ
    createSnowman();
    snowman.position.set(0, 2.6, -100);

    // 木を作る関数を呼ぶ
    createTree();
    tree.position.set(0, 0, border / 3);
    tree2.position.set(0, 0, border);

    // 床面
    var geometry1 = new THREE.BoxGeometry(border / 2.5, 0.1, border);
    var material1 = new THREE.MeshToonMaterial({ color: 0xF5FAFD });
    var floor = new THREE.Mesh(geometry1, material1);
    floor.position.set(0, 0, 0);
    // 床面に影を受け付ける
    floor.receiveShadow = true;
    // シーンにオブジェクトを追加
    scene.add(floor);

    // 壁を作る
    leftwall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 10, border),
        new THREE.MeshToonMaterial({ color: 0xdeb887 }));
    rightwall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 10, border),
        new THREE.MeshToonMaterial({ color: 0xdeb887 }));
    leftwall.position.set(-100, 5, 0);
    scene.add(leftwall);
    rightwall.position.set(100, 5, 0);
    scene.add(rightwall);

    // カメラを設定
    camera = new THREE.PerspectiveCamera(90, width / height, 1, 1000);
    camera.position.set(0, 100, 47);
    camera.lookAt(scene.position);
    camera.rotation.x = -1.12;

    //レンダラを作成
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas1') });
    renderer.setClearColor(0xE3FBFF, 1.0); // レンダラの背景を白色かつ不透明に設定
    renderer.setSize(width, height);

    // レンダラで影を有効にする
    renderer.shadowMap.enabled = true;

    // 確認用のカメラコントローラー
    // var controls = new THREE.OrbitControls(camera, renderer.domElement);

    reset();

    update();
}

function update() {
    if (!isEnd) {
        // 雪玉を転がす
        snowman.rotation.x += speed * 0.1;
        // 雪玉を大きくする
        snowman.scale.x += 0.001;
        snowman.scale.y += 0.001;
        snowman.scale.z += 0.001;
        snowman.position.y += 0.005;

        // 木を動かす
        tree.position.z -= speed;
        tree2.position.z -= speed;

        // 雪玉をadで左右に動かす
        var snowradius = snowman.scale.x * 6;
        var roadwidth = border / 5 - snowradius;
        if (snowman.position.x >= -roadwidth && snowman.position.x <= roadwidth) {
            snowman.position.x += shiftx;
        } else if (shiftx > 0) {
            snowman.position.x = roadwidth - 0.2;
        } else if (shiftx < 0) {
            snowman.position.x = - roadwidth + 0.2;
        }

        // 木と雪玉の当たり判定
        if (isCheck) {
            distance = 10 + snowradius;
            if (tree.position.z < -100 + snowradius && tree.position.z > -100 - snowradius) {
                isCheck = false;
                if (snowman.position.x + snowradius > tree.position.x && snowman.position.x - snowradius < tree.position.x) {
                    isEnd = true;
                }
            }
            if (tree2.position.z < -100 + snowradius && tree.position.z > -100 - snowradius) {
                isCheck = false;
                if (snowman.position.x + snowradius > tree2.position.x && snowman.position.x - snowradius < tree2.position.x) {
                    isEnd = true;
                }
            }
        }

        if (tree.position.z <= -border / 2) repeat();
        if (tree2.position.z <= -border / 2) repeat2();

        document.getElementById("pclr").innerHTML = '経過秒数：' + count + '秒';

    } else {
        document.getElementById("end").innerHTML = '<font color=#F43254><font size="5">終了です！ 結果：' + count + '秒</font>';
    }


    renderer.render(scene, camera);　// レンダラーに描画することを命令する
    requestAnimationFrame(update);
}




// 雪玉を作る関数
function createSnowman() {
    // パーツをグループに登録するためのグループ（入れ物）を定義
    snowman = new THREE.Group();

    var sphere1 = new THREE.SphereGeometry(5, 50, 50);
    var sphere3 = new THREE.SphereGeometry(1, 10, 10);
    var material1 = new THREE.MeshToonMaterial({ color: 0xF5FAFD });
    var material2 = new THREE.MeshToonMaterial({ color: 0x000000 });

    var head = new THREE.Mesh(sphere1, material1);
    var lefteye = new THREE.Mesh(sphere3, material2);
    var righteye = new THREE.Mesh(sphere3, material2);

    lefteye.position.x += 2;
    lefteye.position.y += 2.5;
    lefteye.position.z += 3;
    righteye.position.x -= 2;
    righteye.position.y += 2.5;
    righteye.position.z += 3;

    snowman.add(head);
    snowman.add(righteye);
    snowman.add(lefteye);
    scene.add(snowman);
}

// 木を作る関数
function createTree() {
    // パーツをグループに登録するためのグループ（入れ物）を定義
    tree = new THREE.Group();
    tree2 = new THREE.Group();

    var cone1 = new THREE.ConeGeometry(20, 25, 10); // 半径, 高さ, 分割数
    var cone2 = new THREE.ConeGeometry(30, 40, 10);　// 半径, 高さ, 分割数
    var conematerial = new THREE.MeshToonMaterial({ color: 0xA3E0C1 });
    var cylinder = new THREE.CylinderGeometry(10, 10, 40, 10),　// 上面の半径, 下面の半径, 高さ, 分割数
        cylindermaterial = new THREE.MeshToonMaterial({ color: 0x755325 });

    var topcone = new THREE.Mesh(cone1, conematerial);
    var nextcone = new THREE.Mesh(cone2, conematerial);
    var stem = new THREE.Mesh(cylinder, cylindermaterial);

    topcone.position.y += 65;
    nextcone.position.y += 50;
    stem.position.y += 20

    topcone.castShadow = true;
    nextcone.castShadow = true;

    tree.add(topcone);
    tree.add(nextcone);
    tree.add(stem);
    scene.add(tree);

    var topcone = new THREE.Mesh(cone1, conematerial);
    var nextcone = new THREE.Mesh(cone2, conematerial);
    var stem = new THREE.Mesh(cylinder, cylindermaterial);

    topcone.position.y += 65;
    nextcone.position.y += 50;
    stem.position.y += 20

    topcone.castShadow = true;
    nextcone.castShadow = true;

    tree2.add(topcone);
    tree2.add(nextcone);
    tree2.add(stem);
    scene.add(tree2);
}

function repeat() {
    tree.position.set(0, 0, border / 3);
    tree.position.x = THREE.MathUtils.randInt(-border / 5, border / 5);
    speed += 0.05;
    isCheck = true;
}

function repeat2() {
    tree2.position.set(0, 0, border / 3);
    tree2.position.x = THREE.MathUtils.randInt(-border / 5, border / 5);
    speed += 0.05;
    isCheck = true;
}

function reset() {
    hit = 0;
    score = 0;
    snowman.position.set(0, 2.6, -100);
    speed = THREE.MathUtils.randFloat(1, 5);
    speed = 1;
    isEnd = false;
    isChesk = true;
}
